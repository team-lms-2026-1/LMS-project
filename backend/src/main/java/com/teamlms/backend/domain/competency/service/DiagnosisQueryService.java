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
import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionType;
import com.teamlms.backend.domain.competency.repository.*;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.domain.competency.enums.DiagnosisTargetStatus;
import com.teamlms.backend.domain.semester.entity.Semester;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.time.LocalDateTime;
import java.math.RoundingMode;

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
        private final DiagnosisAnswerRepository diagnosisAnswerRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final DeptRepository deptRepository;
        private final SemesterCompetencyCohortStatRepository statRepository;
        private final SemesterStudentCompetencySummaryRepository summaryRepository;
        private final CompetencyRepository competencyRepository;

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
                if (target.getStatus() == DiagnosisTargetStatus.SUBMITTED) {
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

                long targetCount = diagnosisTargetRepository.countByRunRunId(runId);
                List<DiagnosisSubmission> submissions = diagnosisSubmissionRepository.findByRunRunId(runId);
                int responseCount = submissions.size();

                if (submissions.isEmpty()) {
                        return DiagnosisReportResponse.builder()
                                        .summary(DiagnosisReportSummary.builder()
                                                        .targetCount((int) targetCount)
                                                        .responseCount(responseCount)
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

                Long semesterId = run.getSemester().getSemesterId();
                List<Long> respondentIdList = submissions.stream()
                                .map(s -> s.getStudent().getAccountId())
                                .collect(Collectors.toList());
                Set<Long> respondentIdSet = new HashSet<>(respondentIdList);

                List<SemesterStudentCompetencySummary> summaries = summaryRepository
                                .findBySemesterSemesterId(semesterId);
                List<SemesterStudentCompetencySummary> respondentSummaries = summaries.stream()
                                .filter(s -> respondentIdSet.contains(s.getStudent().getAccountId()))
                                .collect(Collectors.toList());

                if (respondentSummaries.isEmpty()) {
                        return DiagnosisReportResponse.builder()
                                        .summary(DiagnosisReportSummary.builder()
                                                        .targetCount((int) targetCount)
                                                        .responseCount(responseCount)
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

                List<Competency> competencies = competencyRepository.findAll();
                competencies.sort(Comparator.comparing(
                                Competency::getSortOrder,
                                Comparator.nullsLast(Integer::compareTo)));

                Map<Long, Map<Long, BigDecimal>> respondentScores = new HashMap<>();
                for (SemesterStudentCompetencySummary summaryRow : respondentSummaries) {
                        Long studentId = summaryRow.getStudent().getAccountId();
                        Long competencyId = summaryRow.getCompetency().getCompetencyId();
                        BigDecimal score = summaryRow.getTotalScore() != null
                                        ? summaryRow.getTotalScore()
                                        : BigDecimal.ZERO;
                        respondentScores
                                        .computeIfAbsent(studentId, k -> new HashMap<>())
                                        .put(competencyId, score);
                }

                List<CompetencyRadarItem> radarChart = new ArrayList<>();
                List<CompetencyStatsTableItem> statsTable = new ArrayList<>();
                BigDecimal totalAverage = BigDecimal.ZERO;
                int averageCount = 0;

                LocalDateTime calculatedAt = respondentSummaries.stream()
                                .map(SemesterStudentCompetencySummary::getCalculatedAt)
                                .max(LocalDateTime::compareTo)
                                .orElse(null);

                for (Competency comp : competencies) {
                        Long competencyId = comp.getCompetencyId();
                        List<BigDecimal> scores = new ArrayList<>();
                        for (Long studentId : respondentIdList) {
                                Map<Long, BigDecimal> compScores = respondentScores
                                                .getOrDefault(studentId, Map.of());
                                BigDecimal value = compScores.getOrDefault(competencyId, BigDecimal.ZERO);
                                scores.add(value);
                        }

                        BigDecimal mean = calculateMean(scores);
                        BigDecimal median = calculateMedian(scores);
                        BigDecimal stdDev = calculateStdDev(scores, mean);

                        if (mean != null) {
                                totalAverage = totalAverage.add(mean);
                                averageCount += 1;
                        }

                        radarChart.add(CompetencyRadarItem.builder()
                                        .label(comp.getName())
                                        .score(mean)
                                        .build());

                        statsTable.add(CompetencyStatsTableItem.builder()
                                        .competencyName(comp.getName())
                                        .targetCount((int) targetCount)
                                        .responseCount(responseCount)
                                        .mean(mean)
                                        .median(median)
                                        .stdDev(stdDev)
                                        .updatedAt(calculatedAt)
                                        .build());
                }

                BigDecimal averagedTotal = averageCount > 0
                                ? totalAverage.divide(BigDecimal.valueOf(averageCount), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                DiagnosisReportSummary summary = DiagnosisReportSummary.builder()
                                .targetCount((int) targetCount)
                                .responseCount(responseCount)
                                .totalAverage(averagedTotal)
                                .build();

                List<DiagnosisRun> closedRuns = diagnosisRunRepository.findByStatus(DiagnosisRunStatus.CLOSED);
                List<Semester> trendSemesters = closedRuns.stream()
                                .map(DiagnosisRun::getSemester)
                                .filter(Objects::nonNull)
                                .distinct()
                                .sorted(Comparator.comparing(Semester::getSemesterId))
                                .collect(Collectors.toList());
                List<String> categories = trendSemesters.stream()
                                .map(Semester::getDisplayName)
                                .collect(Collectors.toList());
                List<Long> semesterIds = trendSemesters.stream()
                                .map(Semester::getSemesterId)
                                .collect(Collectors.toList());
                if (categories.isEmpty()) {
                        categories = List.of("-");
                }

                List<Dept> targetDepts;
                if (run.getDeptId() != null) {
                        targetDepts = deptRepository.findAllById(List.of(run.getDeptId()));
                } else {
                        targetDepts = deptRepository.findAll();
                        targetDepts.sort(Comparator.comparing(
                                        Dept::getDeptName,
                                        Comparator.nullsLast(String::compareTo)));
                }

                Map<Long, Map<Long, Map<Long, BigDecimal>>> deptCompSemesterAvgMap = new HashMap<>();
                if (!semesterIds.isEmpty()) {
                        Map<Long, Long> runSemesterMap = closedRuns.stream()
                                        .filter(r -> r.getSemester() != null)
                                        .collect(Collectors.toMap(
                                                        DiagnosisRun::getRunId,
                                                        r -> r.getSemester().getSemesterId(),
                                                        (a, b) -> a));
                        List<Long> runIds = new ArrayList<>(runSemesterMap.keySet());
                        Map<Long, Set<Long>> respondentIdsBySemester = new HashMap<>();

                        if (!runIds.isEmpty()) {
                                List<DiagnosisSubmission> allSubmissions = diagnosisSubmissionRepository
                                                .findByRunRunIdIn(runIds);
                                for (DiagnosisSubmission submission : allSubmissions) {
                                        DiagnosisRun submissionRun = submission.getRun();
                                        if (submissionRun == null) {
                                                continue;
                                        }
                                        Long semId = runSemesterMap.get(submissionRun.getRunId());
                                        if (semId == null) {
                                                continue;
                                        }
                                        respondentIdsBySemester
                                                        .computeIfAbsent(semId, k -> new HashSet<>())
                                                        .add(submission.getStudent().getAccountId());
                                }
                        }

                        for (Long semId : semesterIds) {
                                Set<Long> semRespondents = respondentIdsBySemester.getOrDefault(semId, Set.of());
                                if (semRespondents.isEmpty()) {
                                        continue;
                                }

                                List<SemesterStudentCompetencySummary> semesterSummaries = summaryRepository
                                                .findBySemesterSemesterId(semId);
                                List<SemesterStudentCompetencySummary> filteredSummaries = semesterSummaries.stream()
                                                .filter(s -> semRespondents.contains(s.getStudent().getAccountId()))
                                                .collect(Collectors.toList());
                                if (filteredSummaries.isEmpty()) {
                                        continue;
                                }

                                Map<Long, Long> studentDeptMap = studentProfileRepository.findAllById(semRespondents)
                                                .stream()
                                                .filter(p -> p.getDeptId() != null)
                                                .collect(Collectors.toMap(
                                                                StudentProfile::getAccountId,
                                                                StudentProfile::getDeptId,
                                                                (a, b) -> a));

                                Map<Long, Map<Long, BigDecimal>> sumByDeptComp = new HashMap<>();
                                Map<Long, Map<Long, Integer>> countByDeptComp = new HashMap<>();

                                for (SemesterStudentCompetencySummary summaryRow : filteredSummaries) {
                                        Long studentId = summaryRow.getStudent().getAccountId();
                                        Long deptId = studentDeptMap.get(studentId);
                                        if (deptId == null) {
                                                continue;
                                        }
                                        Long competencyId = summaryRow.getCompetency().getCompetencyId();
                                        BigDecimal score = summaryRow.getTotalScore() != null
                                                        ? summaryRow.getTotalScore()
                                                        : BigDecimal.ZERO;

                                        sumByDeptComp
                                                        .computeIfAbsent(deptId, k -> new HashMap<>())
                                                        .merge(competencyId, score, BigDecimal::add);
                                        countByDeptComp
                                                        .computeIfAbsent(deptId, k -> new HashMap<>())
                                                        .merge(competencyId, 1, Integer::sum);
                                }

                                Map<Long, Map<Long, BigDecimal>> deptCompAvgMap = new HashMap<>();
                                for (Map.Entry<Long, Map<Long, BigDecimal>> deptEntry : sumByDeptComp.entrySet()) {
                                        Long deptId = deptEntry.getKey();
                                        Map<Long, BigDecimal> compSumMap = deptEntry.getValue();
                                        Map<Long, Integer> compCountMap = countByDeptComp
                                                        .getOrDefault(deptId, Map.of());

                                        Map<Long, BigDecimal> compAvgMap = new HashMap<>();
                                        for (Map.Entry<Long, BigDecimal> compEntry : compSumMap.entrySet()) {
                                                Long competencyId = compEntry.getKey();
                                                BigDecimal sum = compEntry.getValue();
                                                int count = compCountMap.getOrDefault(competencyId, 0);
                                                BigDecimal avgScore = count > 0
                                                                ? sum.divide(BigDecimal.valueOf(count), 2,
                                                                                RoundingMode.HALF_UP)
                                                                : BigDecimal.ZERO;
                                                compAvgMap.put(competencyId, avgScore);
                                        }
                                        deptCompAvgMap.put(deptId, compAvgMap);
                                }
                                deptCompSemesterAvgMap.put(semId, deptCompAvgMap);
                        }
                }

                List<CompetencyTrendSeries> series = new ArrayList<>();
                for (Dept dept : targetDepts) {
                        Long deptId = dept.getDeptId();
                        for (Competency comp : competencies) {
                                List<BigDecimal> data = new ArrayList<>();
                                if (semesterIds.isEmpty()) {
                                        data.add(BigDecimal.ZERO);
                                } else {
                                        for (Long semId : semesterIds) {
                                                Map<Long, Map<Long, BigDecimal>> deptMap = deptCompSemesterAvgMap
                                                                .getOrDefault(semId, Map.of());
                                                Map<Long, BigDecimal> compMap = deptMap.getOrDefault(deptId, Map.of());
                                                data.add(compMap.getOrDefault(comp.getCompetencyId(), BigDecimal.ZERO));
                                        }
                                }
                                series.add(CompetencyTrendSeries.builder()
                                                .name(String.format("%s - %s", dept.getDeptName(), comp.getName()))
                                                .data(data)
                                                .build());
                        }
                }

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

        private BigDecimal calculateMean(List<BigDecimal> values) {
                if (values == null || values.isEmpty()) {
                        return BigDecimal.ZERO;
                }
                BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                return sum.divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
        }

        private BigDecimal calculateMedian(List<BigDecimal> values) {
                if (values == null || values.isEmpty()) {
                        return BigDecimal.ZERO;
                }
                List<BigDecimal> sorted = values.stream()
                                .filter(Objects::nonNull)
                                .sorted()
                                .collect(Collectors.toList());
                if (sorted.isEmpty()) {
                        return BigDecimal.ZERO;
                }
                int size = sorted.size();
                int mid = size / 2;
                if (size % 2 == 1) {
                        return sorted.get(mid).setScale(2, RoundingMode.HALF_UP);
                }
                BigDecimal sum = sorted.get(mid - 1).add(sorted.get(mid));
                return sum.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        }

        private BigDecimal calculateStdDev(List<BigDecimal> values, BigDecimal mean) {
                if (values == null || values.isEmpty()) {
                        return BigDecimal.ZERO;
                }
                double meanValue = mean != null ? mean.doubleValue() : 0d;
                double variance = values.stream()
                                .mapToDouble(value -> {
                                        double diff = value.doubleValue() - meanValue;
                                        return diff * diff;
                                })
                                .average()
                                .orElse(0d);
                return BigDecimal.valueOf(Math.sqrt(variance)).setScale(2, RoundingMode.HALF_UP);
        }

        private BigDecimal calculateQuestionScore(DiagnosisAnswer ans, String compCode) {
                DiagnosisQuestion q = ans.getQuestion();
                int weight = getQuestionWeight(q, compCode);
                if (weight <= 0) {
                        return BigDecimal.ZERO;
                }

                if (q.getQuestionType() == DiagnosisQuestionType.SCALE) {
                        Integer choiceScore = getChoiceScore(q, ans.getScaleValue());
                        return choiceScore != null
                                        ? BigDecimal.valueOf(choiceScore * (long) weight)
                                        : BigDecimal.ZERO;
                } else if (q.getQuestionType() == DiagnosisQuestionType.SHORT) {
                        return Boolean.TRUE.equals(ans.getIsCorrect())
                                        ? BigDecimal.valueOf(weight)
                                        : BigDecimal.ZERO;
                }

                return BigDecimal.ZERO;
        }

        private Integer getChoiceScore(DiagnosisQuestion q, Integer scaleValue) {
                if (scaleValue == null) {
                        return null;
                }
                return switch (scaleValue) {
                        case 5 -> q.getScore1() != null ? q.getScore1() : 5;
                        case 4 -> q.getScore2() != null ? q.getScore2() : 4;
                        case 3 -> q.getScore3() != null ? q.getScore3() : 3;
                        case 2 -> q.getScore4() != null ? q.getScore4() : 2;
                        case 1 -> q.getScore5() != null ? q.getScore5() : 1;
                        default -> 0;
                };
        }

        private int getQuestionWeight(DiagnosisQuestion q, String code) {
                return switch (code) {
                        case "C1" -> q.getC1MaxScore();
                        case "C2" -> q.getC2MaxScore();
                        case "C3" -> q.getC3MaxScore();
                        case "C4" -> q.getC4MaxScore();
                        case "C5" -> q.getC5MaxScore();
                        case "C6" -> q.getC6MaxScore();
                        default -> 0;
                };
        }

        private Long toLong(Object value) {
                if (value == null) {
                        return null;
                }
                if (value instanceof Number) {
                        return ((Number) value).longValue();
                }
                return null;
        }

        private BigDecimal toScaledDecimal(Object value) {
                if (value == null) {
                        return BigDecimal.ZERO;
                }
                if (value instanceof BigDecimal) {
                        return ((BigDecimal) value).setScale(2, RoundingMode.HALF_UP);
                }
                if (value instanceof Number) {
                        return BigDecimal.valueOf(((Number) value).doubleValue())
                                        .setScale(2, RoundingMode.HALF_UP);
                }
                return BigDecimal.ZERO;
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
