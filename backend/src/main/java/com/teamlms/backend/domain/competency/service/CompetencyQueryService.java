package com.teamlms.backend.domain.competency.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.competency.api.dto.*;
import com.teamlms.backend.domain.competency.entitiy.Competency;
import com.teamlms.backend.domain.competency.entitiy.SemesterCompetencyCohortStat;
import com.teamlms.backend.domain.competency.entitiy.SemesterStudentCompetencySummary;
import com.teamlms.backend.domain.competency.repository.CompetencyRepository;
import com.teamlms.backend.domain.competency.repository.SemesterCompetencyCohortStatRepository;
import com.teamlms.backend.domain.competency.repository.SemesterStudentCompetencySummaryRepository;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.semester.entity.Semester;
// import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompetencyQueryService {

        private final StudentProfileRepository studentProfileRepository;
        private final SemesterStudentCompetencySummaryRepository summaryRepository;
        private final SemesterCompetencyCohortStatRepository statRepository;
        private final CompetencyRepository competencyRepository;
        // private final SemesterRepository semesterRepository;
        private final DeptRepository deptRepository;

        /**
         * 학생 목록 조회
         */
        public Page<CompetencyStudentListItem> searchCompetencyStudents(String keyword, Pageable pageable) {
                Page<StudentProfile> profiles = studentProfileRepository.findAll(pageable);

                List<Long> deptIds = profiles.getContent().stream()
                                .map(StudentProfile::getDeptId)
                                .filter(java.util.Objects::nonNull)
                                .distinct()
                                .collect(Collectors.toList());
                Map<Long, String> deptMap = deptRepository.findAllById(deptIds).stream()
                                .collect(Collectors.toMap(Dept::getDeptId, Dept::getDeptName));

                return profiles.map(profile -> CompetencyStudentListItem.builder()
                                .accountId(profile.getAccountId())
                                .studentNumber(profile.getStudentNo())
                                .name(profile.getName())
                                .grade(profile.getGradeLevel())
                                .deptName(deptMap.getOrDefault(profile.getDeptId(), "Unknown"))
                                .build());
        }

        /**
         * 학생 상세 역량 활동 조회 (대시보드)
         */
        public StudentCompetencyDashboardResponse getStudentDashboard(Long studentId) {
                StudentProfile profile = studentProfileRepository.findById(studentId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, studentId));

                Dept dept = deptRepository.findById(profile.getDeptId()).orElse(null);

                // 1. 프로필 정보
                StudentProfileInfo profileInfo = StudentProfileInfo.builder()
                                .name(profile.getName())
                                .studentNumber(profile.getStudentNo())
                                .deptName(dept != null ? dept.getDeptName() : "N/A")
                                .grade(profile.getGradeLevel())
                                .build();

                // 2. 모든 역량과 학생 요약 데이터 조회
                List<Competency> allCompetencies = competencyRepository.findAll();
                List<SemesterStudentCompetencySummary> summaries = summaryRepository.findByStudentAccountId(studentId);

                if (summaries.isEmpty()) {
                        return emptyDashboard(profileInfo);
                }

                // 학기별 정렬
                List<Long> semesterIds = summaries.stream()
                                .map(s -> s.getSemester().getSemesterId())
                                .distinct()
                                .sorted(Comparator.reverseOrder())
                                .collect(Collectors.toList());

                Long latestSemesterId = semesterIds.get(0);
                List<SemesterStudentCompetencySummary> latestSummaries = summaries.stream()
                                .filter(s -> s.getSemester().getSemesterId().equals(latestSemesterId))
                                .collect(Collectors.toList());

                // 3. 상단 요약 정보
                BigDecimal maxTotalScore = summaries.stream()
                                .map(SemesterStudentCompetencySummary::getTotalScore)
                                .max(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO);

                BigDecimal avgTotalScore = summaries.stream()
                                .map(SemesterStudentCompetencySummary::getTotalScore)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(BigDecimal.valueOf(summaries.size()), 2, RoundingMode.HALF_UP);

                CompetencySummaryInfo summaryInfo = CompetencySummaryInfo.builder()
                                .maxScore(maxTotalScore)
                                .recentAvg(avgTotalScore)
                                .lastEvaluationDate(summaries.stream()
                                                .map(SemesterStudentCompetencySummary::getCalculatedAt)
                                                .max(LocalDateTime::compareTo)
                                                .orElse(null))
                                .build();

                // 4. 레이더 차트 (최근 학기 기준)
                List<CompetencyRadarItem> radarChart = latestSummaries.stream()
                                .map(s -> CompetencyRadarItem.builder()
                                                .label(s.getCompetency().getName())
                                                .score(s.getTotalScore())
                                                .build())
                                .collect(Collectors.toList());

                // 5. 트렌드 차트 (학기별 추이)
                List<Semester> sortedSemesters = summaries.stream()
                                .map(SemesterStudentCompetencySummary::getSemester)
                                .distinct()
                                .sorted(Comparator.comparing(Semester::getSemesterId))
                                .collect(Collectors.toList());

                List<String> categories = sortedSemesters.stream()
                                .map(Semester::getDisplayName)
                                .collect(Collectors.toList());

                List<CompetencyTrendSeries> series = allCompetencies.stream()
                                .map(comp -> {
                                        List<BigDecimal> data = new ArrayList<>();
                                        for (Semester sem : sortedSemesters) {
                                                BigDecimal score = summaries.stream()
                                                                .filter(s -> s.getSemester().getSemesterId()
                                                                                .equals(sem.getSemesterId())
                                                                                && s.getCompetency().getCompetencyId()
                                                                                                .equals(comp.getCompetencyId()))
                                                                .map(SemesterStudentCompetencySummary::getTotalScore)
                                                                .findFirst()
                                                                .orElse(BigDecimal.ZERO);
                                                data.add(score);
                                        }
                                        return CompetencyTrendSeries.builder()
                                                        .name(comp.getName())
                                                        .data(data)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                // 6. 통계 테이블 (최근 학기 기준)
                List<SemesterCompetencyCohortStat> totalStats = statRepository
                                .findBySemesterSemesterId(latestSemesterId);
                Map<Long, SemesterCompetencyCohortStat> totalStatMap = totalStats.stream()
                                .collect(Collectors.toMap(s -> s.getCompetency().getCompetencyId(), s -> s));

                List<CompetencyMyStatsTableItem> myStatsTable = latestSummaries.stream()
                                .map(s -> {
                                        SemesterCompetencyCohortStat stat = totalStatMap
                                                        .get(s.getCompetency().getCompetencyId());
                                        return CompetencyMyStatsTableItem.builder()
                                                        .competencyName(s.getCompetency().getName())
                                                        .myScore(s.getTotalScore())
                                                        .avgScore(stat != null ? stat.getMean() : BigDecimal.ZERO)
                                                        .maxScore(stat != null ? stat.getMaxScore() : BigDecimal.ZERO)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return StudentCompetencyDashboardResponse.builder()
                                .profile(profileInfo)
                                .summary(summaryInfo)
                                .radarChart(radarChart)
                                .trendChart(DiagnosisTrendChart.builder()
                                                .categories(categories)
                                                .series(series)
                                                .build())
                                .myStatsTable(myStatsTable)
                                .build();
        }

        private StudentCompetencyDashboardResponse emptyDashboard(StudentProfileInfo profile) {
                return StudentCompetencyDashboardResponse.builder()
                                .profile(profile)
                                .summary(CompetencySummaryInfo.builder()
                                                .maxScore(BigDecimal.ZERO)
                                                .recentAvg(BigDecimal.ZERO)
                                                .build())
                                .radarChart(List.of())
                                .trendChart(DiagnosisTrendChart.builder()
                                                .categories(List.of())
                                                .series(List.of())
                                                .build())
                                .myStatsTable(List.of())
                                .build();
        }
}
