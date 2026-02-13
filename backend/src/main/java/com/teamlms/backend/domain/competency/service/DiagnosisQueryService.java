package com.teamlms.backend.domain.competency.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.competency.api.dto.*;
import com.teamlms.backend.domain.competency.entitiy.*;
import com.teamlms.backend.domain.competency.enums.DiagnosisRunStatus;
import com.teamlms.backend.domain.competency.repository.*;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 진단 조회 서비스 (읽기 전용)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiagnosisQueryService {

        private final DiagnosisRunRepository diagnosisRunRepository;
        private final DiagnosisQuestionRepository diagnosisQuestionRepository;
        private final DiagnosisTargetRepository diagnosisTargetRepository;
        private final DiagnosisSubmissionRepository diagnosisSubmissionRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final DeptRepository deptRepository;
        private final SemesterCompetencyCohortStatRepository statRepository;
        private final SemesterStudentCompetencySummaryRepository summaryRepository;
        private final CompetencySummaryService competencySummaryService;

        /**
         * 진단지 목록 조회
         */
        public Page<DiagnosisListItem> listDiagnoses(Pageable pageable) {
                Page<DiagnosisRun> runs = diagnosisRunRepository.findAll(pageable);

                // N+1 방지를 위해 부서 정보 미리 조회
                List<Long> deptIds = runs.getContent().stream()
                                .map(DiagnosisRun::getDeptId)
                                .filter(java.util.Objects::nonNull)
                                .distinct()
                                .collect(Collectors.toList());
                Map<Long, String> deptMap = deptRepository.findAllById(deptIds).stream()
                                .collect(Collectors.toMap(Dept::getDeptId, Dept::getDeptName));

                return runs.map(run -> toDiagnosisListItem(run, deptMap));
        }

        /**
         * 진단지 상세 조회
         */
        public DiagnosisDetailResponse getDiagnosisDetail(Long diagnosisId) {
                DiagnosisRun diagnosisRun = diagnosisRunRepository.findById(diagnosisId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, diagnosisId));

                List<DiagnosisQuestion> questions = diagnosisQuestionRepository
                                .findByRunRunIdOrderBySortOrderAsc(diagnosisId);

                DiagnosisBasicInfo basicInfo = DiagnosisBasicInfo.builder()
                                .diagnosisId(diagnosisRun.getRunId())
                                .title(diagnosisRun.getTitle())
                                .semesterId(diagnosisRun.getSemester().getSemesterId())
                                .targetGrade(diagnosisRun.getTargetGrade())
                                .deptId(diagnosisRun.getDeptId())
                                .startedAt(diagnosisRun.getStartAt())
                                .endedAt(diagnosisRun.getEndAt())
                                .status(diagnosisRun.getStatus().name())
                                .build();

                List<DiagnosisQuestionDetail> questionDetails = questions.stream()
                                .map(this::toQuestionDetail)
                                .collect(Collectors.toList());

                return DiagnosisDetailResponse.builder()
                                .basicInfo(basicInfo)
                                .questions(questionDetails)
                                .build();
        }

        /**
         * 진단 참여자 목록 조회 (미실시자 위주)
         */
        public Page<DiagnosisParticipantItem> getParticipants(Long diagnosisId, Pageable pageable) {
                if (!diagnosisRunRepository.existsById(diagnosisId)) {
                        throw new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, diagnosisId);
                }

                // Note: 실제로는 QueryDSL 등으로 조인 페이징 처리가 필요하지만
                // 여기서는 JpaRepository 기본 기능 위주로 구현
                List<DiagnosisTarget> targets = diagnosisTargetRepository.findByRunRunId(diagnosisId);

                List<DiagnosisParticipantItem> items = targets.stream()
                                .map(target -> {
                                        StudentProfile profile = studentProfileRepository
                                                        .findById(target.getStudent().getAccountId())
                                                        .orElse(null);
                                        Dept dept = (profile != null)
                                                        ? deptRepository.findById(profile.getDeptId()).orElse(null)
                                                        : null;

                                        return DiagnosisParticipantItem.builder()
                                                        .targetId(target.getTargetId())
                                                        .studentNumber(profile != null ? profile.getStudentNo() : "N/A")
                                                        .name(profile != null ? profile.getName() : "Unknown")
                                                        .email(profile != null ? profile.getEmail() : "N/A")
                                                        .grade(profile != null ? profile.getGradeLevel() : null)
                                                        .deptName(dept != null ? dept.getDeptName() : "N/A")
                                                        .status(target.getStatus().name())
                                                        .build();
                                })
                                .collect(Collectors.toList());

                // Page 변환
                int start = (int) pageable.getOffset();
                int end = Math.min((start + pageable.getPageSize()), items.size());
                List<DiagnosisParticipantItem> pagedItems = (start < items.size())
                                ? items.subList(start, end)
                                : List.of();

                return new org.springframework.data.domain.PageImpl<>(pagedItems, pageable, items.size());
        }

        /**
         * 내 진단 목록 조회 (학생용)
         */
    public List<MyDiagnosisListItem> listMyDiagnoses(Long accountId) {
        List<DiagnosisTarget> targets = diagnosisTargetRepository
                        .findByStudentAccountIdAndRunStatus(accountId, DiagnosisRunStatus.OPEN);

        return targets.stream()
                        .map(target -> MyDiagnosisListItem.builder()
                                        .diagnosisId(target.getRun().getRunId())
                                        .title(target.getRun().getTitle())
                                        .semesterName(target.getRun().getSemester().getDisplayName())
                                        .startedAt(target.getRun().getStartAt())
                                        .endedAt(target.getRun().getEndAt())
                                        .status(target.getStatus().name())
                                        .diagnosisStatus(target.getRun().getStatus().name())
                                        .build())
                        .collect(Collectors.toList());
        }

        /**
         * 학생용 진단 문항 조회 (참여 대상 검증 포함)
         */
        public DiagnosisDetailResponse getDiagnosisQuestionsForStudent(Long diagnosisId, Long accountId) {
                // 1. 참여 대상 여부 확인
                DiagnosisTarget target = diagnosisTargetRepository.findByRunRunIdAndStudentAccountId(diagnosisId,
                                accountId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, diagnosisId));

                // 2. 이미 제출했는지 확인
                if (target.getStatus() == com.teamlms.backend.domain.competency.enums.DiagnosisTargetStatus.SUBMITTED) {
                        // RE-TAKE 정책이 따로 없다면 차단
                        // throw new BusinessException(ErrorCode.ALREADY_SUBMITTED_DIAGNOSIS);
                }

                return getDiagnosisDetail(diagnosisId);
        }

        /**
         * 진단 리포트 조회
         */
        @Transactional
        public DiagnosisReportResponse getDiagnosisReport(Long runId) {
                DiagnosisRun run = diagnosisRunRepository.findById(runId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, runId));

                Long semesterId = run.getSemester().getSemesterId();

                // 1. 역량 통계 데이터 조회 (현재 학기)
                long targetCount = diagnosisTargetRepository.countByRunRunId(runId);
                long responseCount = diagnosisSubmissionRepository.countByRunRunId(runId);
                List<SemesterCompetencyCohortStat> currentStats = statRepository.findBySemesterSemesterId(semesterId);

                if (currentStats.isEmpty() && responseCount > 0) {
                        competencySummaryService.calculateCohortStatistics(semesterId);
                        currentStats = statRepository.findBySemesterSemesterId(semesterId);
                }

                if (currentStats.isEmpty()) {
                        // 대략적인 대상자수만이라도 반환
                        return DiagnosisReportResponse.builder()
                                        .summary(DiagnosisReportSummary.builder()
                                                        .targetCount((int) targetCount)
                                                        .responseCount((int) responseCount)
                                                        .totalAverage(BigDecimal.ZERO)
                                                        .build())
                                        .radarChart(List.of())
                                        .trendChart(DiagnosisTrendChart.builder()
                                                        .categories(List.of())
                                                        .series(List.of())
                                                        .build())
                                        .statsTable(List.of())
                                        .build();
                }

                // 2. 상단 요약 정보 (전체 평균 등)
                int totalTargetCount = currentStats.stream().mapToInt(SemesterCompetencyCohortStat::getTargetCount)
                                .max().orElse(0);
                int totalResponseCount = currentStats.stream()
                                .mapToInt(SemesterCompetencyCohortStat::getCalculatedCount).max().orElse(0);
                BigDecimal totalAverage = currentStats.stream()
                                .map(SemesterCompetencyCohortStat::getMean)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(BigDecimal.valueOf(currentStats.size()), 2, java.math.RoundingMode.HALF_UP);

                DiagnosisReportSummary summary = DiagnosisReportSummary.builder()
                                .targetCount(totalTargetCount)
                                .responseCount(totalResponseCount)
                                .totalAverage(totalAverage)
                                .build();

                // 3. 레이더 차트 (역량별 평균)
                List<CompetencyRadarItem> radarChart = currentStats.stream()
                                .map(s -> CompetencyRadarItem.builder()
                                                .label(s.getCompetency().getName())
                                                .score(s.getMean())
                                                .build())
                                .collect(Collectors.toList());

                // 4. 트렌드 차트 (간소화: 6개 역량의 현재 학기 평균을 시리즈로)
                // 실제 트렌드는 과거 데이터가 필요하나, 우선 현재 학기 기준으로 구조만 잡음
                List<String> categories = List.of(run.getSemester().getDisplayName()); // x축 (학기명)
                List<CompetencyTrendSeries> series = currentStats.stream()
                                .map(s -> CompetencyTrendSeries.builder()
                                                .name(s.getCompetency().getName())
                                                .data(List.of(s.getMean()))
                                                .build())
                                .collect(Collectors.toList());

                // 5. 통계 테이블
                List<CompetencyStatsTableItem> statsTable = currentStats.stream()
                                .map(s -> CompetencyStatsTableItem.builder()
                                                .competencyName(s.getCompetency().getName())
                                                .targetCount(s.getTargetCount())
                                                .responseCount(s.getCalculatedCount())
                                                .mean(s.getMean())
                                                .median(s.getMedian())
                                                .stdDev(s.getStddev())
                                                .updatedAt(s.getCalculatedAt())
                                                .build())
                                .collect(Collectors.toList());

                return DiagnosisReportResponse.builder()
                                .summary(summary)
                                .radarChart(radarChart)
                                .trendChart(DiagnosisTrendChart.builder()
                                                .categories(categories)
                                                .series(series)
                                                .build())
                                .statsTable(statsTable)
                                .build();
        }

        /**
         * 진단 응답 분포 조회
         */
        public DiagnosisDistributionResponse getDiagnosisDistribution(Long runId) {
                DiagnosisRun run = diagnosisRunRepository.findById(runId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, runId));

                Long semesterId = run.getSemester().getSemesterId();
                List<DiagnosisSubmission> submissions = diagnosisSubmissionRepository.findByRunRunId(runId);

                if (submissions.isEmpty()) {
                        return DiagnosisDistributionResponse.builder()
                                        .totalResponseCount(0)
                                        .distribution(List.of())
                                        .build();
                }

                List<Long> studentIds = submissions.stream()
                                .map(s -> s.getStudent().getAccountId())
                                .collect(Collectors.toList());

                // 학생 이름 맵 조회 (N+1 방지)
                Map<Long, String> nameMap = studentProfileRepository.findAllById(studentIds).stream()
                                .collect(Collectors.toMap(StudentProfile::getAccountId, StudentProfile::getName));

                // 해당 학기의 모든 학생 역량 요약 중 제출자 정보만 필터링
                List<SemesterStudentCompetencySummary> summaries = summaryRepository
                                .findBySemesterSemesterId(semesterId);

                List<CompetencyScoreDistributionItem> distribution = summaries.stream()
                                .filter(s -> studentIds.contains(s.getStudent().getAccountId()))
                                .map(s -> CompetencyScoreDistributionItem.builder()
                                                .competencyCode(s.getCompetency().getCode())
                                                .score(s.getDiagnosisScore()) // 진단 점수 기준 분포
                                                .studentName(nameMap.getOrDefault(s.getStudent().getAccountId(),
                                                                "Unknown"))
                                                .studentHash("STU-"
                                                                + s.getStudent().getAccountId().toString().hashCode()
                                                                                % 1000)
                                                .build())
                                .collect(Collectors.toList());

                return DiagnosisDistributionResponse.builder()
                                .totalResponseCount(submissions.size())
                                .distribution(distribution)
                                .build();
        }

        // === Private Helper Methods ===

        private DiagnosisListItem toDiagnosisListItem(DiagnosisRun run, Map<Long, String> deptMap) {
                String deptName = run.getDeptId() != null ? deptMap.getOrDefault(run.getDeptId(), "Individual") : "All";

                return DiagnosisListItem.builder()
                                .diagnosisId(run.getRunId())
                                .title(run.getTitle())
                                .targetGrade(run.getTargetGrade() != null ? run.getTargetGrade() + "학년" : "N/A")
                                .semesterName(run.getSemester().getDisplayName())
                                .deptName(deptName)
                                .startedAt(run.getStartAt())
                                .endedAt(run.getEndAt())
                                .createdAt(run.getCreatedAt())
                                .status(run.getStatus().name())
                                .build();
        }

    private DiagnosisQuestionDetail toQuestionDetail(DiagnosisQuestion question) {
        Map<String, Integer> weights = Map.of(
                        "C1", question.getC1MaxScore(),
                        "C2", question.getC2MaxScore(),
                        "C3", question.getC3MaxScore(),
                        "C4", question.getC4MaxScore(),
                        "C5", question.getC5MaxScore(),
                        "C6", question.getC6MaxScore());

        return DiagnosisQuestionDetail.builder()
                        .questionId(question.getQuestionId())
                        .type(question.getQuestionType().name())
                        .text(question.getContent())
                        .order(question.getSortOrder())
                        .weights(weights)
                        .shortAnswerKey(question.getShortAnswerKey())
                        .label1(question.getLabel1())
                        .label2(question.getLabel2())
                        .label3(question.getLabel3())
                        .label4(question.getLabel4())
                        .label5(question.getLabel5())
                        .score1(question.getScore1())
                        .score2(question.getScore2())
                        .score3(question.getScore3())
                        .score4(question.getScore4())
                        .score5(question.getScore5())
                        .build();
    }
}
