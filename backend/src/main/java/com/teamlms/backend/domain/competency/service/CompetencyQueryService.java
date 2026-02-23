package com.teamlms.backend.domain.competency.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
import com.teamlms.backend.domain.competency.repository.DiagnosisRunRepository;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisRun;
import com.teamlms.backend.domain.competency.enums.DiagnosisRunStatus;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.domain.account.enums.AcademicStatus;
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
        private final DeptRepository deptRepository;
        private final DiagnosisRunRepository diagnosisRunRepository;
        private final SemesterRepository semesterRepository;

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
                return getStudentDashboard(studentId, null);
        }

        public StudentCompetencyDashboardResponse getStudentDashboard(Long studentId, Long semesterId) {
                return getStudentDashboard(studentId, semesterId, "STUDENT");
        }

        public StudentCompetencyDashboardResponse getStudentDashboard(Long studentId, Long semesterId,
                        String trendMode) {
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
                List<SemesterStudentCompetencySummary> allSummaries = summaryRepository
                                .findByStudentAccountId(studentId);
                if (allSummaries.isEmpty()) {
                        return emptyDashboard(profileInfo);
                }

                Long selectedSemesterId;
                List<SemesterStudentCompetencySummary> selectedSummaries;

                if (semesterId != null) {
                        selectedSemesterId = semesterId;
                        selectedSummaries = allSummaries.stream()
                                        .filter(s -> s.getSemester().getSemesterId().equals(selectedSemesterId))
                                        .collect(Collectors.toList());
                        if (selectedSummaries.isEmpty()) {
                                return emptyDashboard(profileInfo);
                        }
                } else {
                        List<Long> semesterIds = allSummaries.stream()
                                        .map(s -> s.getSemester().getSemesterId())
                                        .distinct()
                                        .sorted(Comparator.reverseOrder())
                                        .collect(Collectors.toList());

                        selectedSemesterId = semesterIds.get(0);
                        selectedSummaries = allSummaries.stream()
                                        .filter(s -> s.getSemester().getSemesterId().equals(selectedSemesterId))
                                        .collect(Collectors.toList());
                        if (selectedSummaries.isEmpty()) {
                                return emptyDashboard(profileInfo);
                        }
                }

                BigDecimal maxTotalScore = selectedSummaries.stream()
                                .map(SemesterStudentCompetencySummary::getTotalScore)
                                .max(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO);

                BigDecimal avgTotalScore = selectedSummaries.stream()
                                .map(SemesterStudentCompetencySummary::getTotalScore)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(BigDecimal.valueOf(selectedSummaries.size()), 2, RoundingMode.HALF_UP);

                CompetencySummaryInfo summaryInfo = CompetencySummaryInfo.builder()
                                .maxScore(maxTotalScore)
                                .recentAvg(avgTotalScore)
                                .lastEvaluationDate(selectedSummaries.stream()
                                                .map(SemesterStudentCompetencySummary::getCalculatedAt)
                                                .max(LocalDateTime::compareTo)
                                                .orElse(null))
                                .build();

                // 4. 레이더 차트 (선택 학기 기준)
                List<CompetencyRadarItem> radarChart = selectedSummaries.stream()
                                .map(s -> CompetencyRadarItem.builder()
                                                .label(s.getCompetency().getName())
                                                .score(s.getTotalScore())
                                                .build())
                                .collect(Collectors.toList());

                // 5. 트렌드 차트 (trendMode에 따라 분기)
                List<String> categories;
                List<CompetencyTrendSeries> series;

                if ("DEPARTMENT".equalsIgnoreCase(trendMode)) {
                        // [DEPARTMENT 모드] 학과 평균 추이 (CLOSED 상태 진단 기준)
                        List<DiagnosisRun> closedRuns = diagnosisRunRepository
                                        .findByStatus(DiagnosisRunStatus.CLOSED);

                        List<Semester> trendSemesters = closedRuns.stream()
                                        .filter(run -> run.getDeptId() == null
                                                        || run.getDeptId().equals(profile.getDeptId()))
                                        .map(DiagnosisRun::getSemester)
                                        .distinct()
                                        .sorted(Comparator.comparing(Semester::getSemesterId))
                                        .collect(Collectors.toList());

                        categories = trendSemesters.stream()
                                        .map(Semester::getDisplayName)
                                        .collect(Collectors.toList());

                        if (categories.isEmpty()) {
                                categories = List.of("-");
                        }

                        series = allCompetencies.stream()
                                        .map(comp -> {
                                                List<BigDecimal> data = new ArrayList<>();
                                                for (Semester sem : trendSemesters) {
                                                        Double avgScore = summaryRepository.getDepartmentAverageScore(
                                                                        sem.getSemesterId(),
                                                                        comp.getCompetencyId(),
                                                                        profile.getDeptId());
                                                        data.add(avgScore != null
                                                                        ? BigDecimal.valueOf(avgScore).setScale(2,
                                                                                        RoundingMode.HALF_UP)
                                                                        : BigDecimal.ZERO);
                                                }
                                                return CompetencyTrendSeries.builder()
                                                                .name(comp.getName())
                                                                .data(data)
                                                                .build();
                                        })
                                        .collect(Collectors.toList());
                } else {
                        // [STUDENT 모드] 학생 개인 점수 추이 (기본값)
                        List<Semester> studentSemesters = allSummaries.stream()
                                        .map(SemesterStudentCompetencySummary::getSemester)
                                        .distinct()
                                        .sorted(Comparator.comparing(Semester::getSemesterId))
                                        .collect(Collectors.toList());

                        categories = studentSemesters.stream()
                                        .map(Semester::getDisplayName)
                                        .collect(Collectors.toList());

                        if (categories.isEmpty()) {
                                categories = List.of("-");
                        }

                        series = allCompetencies.stream()
                                        .map(comp -> {
                                                List<BigDecimal> data = new ArrayList<>();
                                                for (Semester sem : studentSemesters) {
                                                        BigDecimal score = allSummaries.stream()
                                                                        .filter(s -> s.getSemester().getSemesterId()
                                                                                        .equals(sem.getSemesterId())
                                                                                        && s.getCompetency()
                                                                                                        .getCompetencyId()
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
                }

                // 6. 통계 테이블 (선택 학기 기준)
                List<SemesterCompetencyCohortStat> totalStats = statRepository
                                .findBySemesterSemesterId(selectedSemesterId);
                Map<Long, SemesterCompetencyCohortStat> totalStatMap = totalStats.stream()
                                .collect(Collectors.toMap(s -> s.getCompetency().getCompetencyId(), s -> s));

                Map<Long, List<SemesterStudentCompetencySummary>> historyByCompetency = allSummaries.stream()
                                .collect(Collectors.groupingBy(
                                                s -> s.getCompetency().getCompetencyId()));

                List<CompetencyMyStatsTableItem> myStatsTable = selectedSummaries.stream()
                                .map(s -> {
                                        SemesterCompetencyCohortStat stat = totalStatMap
                                                        .get(s.getCompetency().getCompetencyId());
                                        List<SemesterStudentCompetencySummary> history = historyByCompetency
                                                        .getOrDefault(s.getCompetency().getCompetencyId(), List.of());

                                        BigDecimal myMax = history.stream()
                                                        .map(SemesterStudentCompetencySummary::getTotalScore)
                                                        .max(BigDecimal::compareTo)
                                                        .orElse(BigDecimal.ZERO);

                                        BigDecimal myAvg = history.isEmpty() ? BigDecimal.ZERO
                                                        : history.stream()
                                                                        .map(SemesterStudentCompetencySummary::getTotalScore)
                                                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                                                        .divide(BigDecimal.valueOf(history.size()), 2,
                                                                                        RoundingMode.HALF_UP);
                                        return CompetencyMyStatsTableItem.builder()
                                                        .competencyName(s.getCompetency().getName())
                                                        .myScore(s.getTotalScore())
                                                        .avgScore(stat != null ? stat.getMean() : BigDecimal.ZERO)
                                                        .maxScore(stat != null ? stat.getMaxScore() : BigDecimal.ZERO)
                                                        .myAvgScore(myAvg)
                                                        .myMaxScore(myMax)
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

        /**
         * 역량 종합 관리용 역량 통계 조회
         */
        public CompetencyResultDashboardResponse getCompetencyResultDashboard(
                        Long diagnosisId,
                        Long semesterId,
                        String semesterName,
                        Long deptId,
                        String deptName,
                        String scope) {
                Semester semester = resolveSemester(diagnosisId, semesterId, semesterName);
                if (semester == null) {
                        return CompetencyResultDashboardResponse.builder()
                                        .summary(DiagnosisReportSummary.builder()
                                                        .targetCount(0)
                                                        .responseCount(0)
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

                Long targetSemesterId = semester.getSemesterId();
                List<Competency> competencies = competencyRepository.findAll();
                competencies.sort(Comparator.comparing(
                                Competency::getSortOrder,
                                Comparator.nullsLast(Integer::compareTo)));

                AcademicStatus targetStatus = AcademicStatus.ENROLLED;
                long totalTargetCount = studentProfileRepository.countByAcademicStatus(targetStatus);
                long totalResponseCount = summaryRepository
                                .countDistinctStudentsBySemesterAndAcademicStatus(targetSemesterId, targetStatus);
                Double avgScoreRaw = summaryRepository
                                .getSemesterAverageTotalScoreByAcademicStatus(targetSemesterId, targetStatus);
                BigDecimal totalAverage = avgScoreRaw != null
                                ? BigDecimal.valueOf(avgScoreRaw).setScale(2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                DiagnosisReportSummary summary = buildSummary(totalTargetCount, totalResponseCount, totalAverage);

                List<SemesterStudentCompetencySummary> enrolledSummaries = summaryRepository
                                .findBySemesterSemesterIdAndAcademicStatus(targetSemesterId, targetStatus);
                List<CompetencyStatsTableItem> statsTable = buildStatsTable(
                                competencies,
                                enrolledSummaries,
                                totalTargetCount);

                List<Object[]> avgRows = summaryRepository.findDeptCompetencyTotalScoreAverages(
                                targetSemesterId,
                                targetStatus);
                Map<Long, Map<Long, BigDecimal>> deptCompetencyAvgMap = new HashMap<>();
                for (Object[] row : avgRows) {
                        Long rowDeptId = toLong(row[0]);
                        Long rowCompetencyId = toLong(row[1]);
                        if (rowDeptId == null || rowCompetencyId == null) {
                                continue;
                        }
                        BigDecimal avgScore = toScaledDecimal(row[2]);
                        deptCompetencyAvgMap
                                        .computeIfAbsent(rowDeptId, k -> new HashMap<>())
                                        .put(rowCompetencyId, avgScore);
                }

                List<Dept> targetDepts = resolveTargetDepts(deptId, deptName);

                List<CompetencyDeptRadarSeries> radarChart = targetDepts.stream()
                                .map(dept -> {
                                        Map<Long, BigDecimal> compMap = deptCompetencyAvgMap
                                                        .getOrDefault(dept.getDeptId(), Map.of());
                                        List<CompetencyRadarItem> items = competencies.stream()
                                                .map(comp -> CompetencyRadarItem.builder()
                                                                .label(comp.getName())
                                                                .score(compMap.getOrDefault(
                                                                                comp.getCompetencyId(),
                                                                                BigDecimal.ZERO))
                                                                .build())
                                                .collect(Collectors.toList());
                                        return CompetencyDeptRadarSeries.builder()
                                                        .deptName(dept.getDeptName())
                                                        .items(items)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                DiagnosisTrendChart trendChart = buildDeptTrendChart(targetDepts, competencies, targetStatus);

                return CompetencyResultDashboardResponse.builder()
                                .summary(summary)
                                .radarChart(radarChart)
                                .trendChart(trendChart)
                                .statsTable(statsTable)
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

        private Semester resolveSemester(Long diagnosisId, Long semesterId, String semesterName) {
                if (semesterId != null) {
                        return semesterRepository.findById(semesterId).orElse(null);
                }
                if (semesterName != null && !semesterName.isBlank()) {
                        String normalized = normalizeSemesterLabel(semesterName);
                        return semesterRepository.findAll().stream()
                                        .filter(sem -> {
                                                if (semesterName.equals(sem.getDisplayName())) {
                                                        return true;
                                                }
                                                String display = sem.getDisplayName();
                                                return display != null && normalizeSemesterLabel(display).equals(normalized);
                                        })
                                        .findFirst()
                                        .orElse(null);
                }
                if (diagnosisId != null) {
                        DiagnosisRun run = diagnosisRunRepository.findById(diagnosisId).orElse(null);
                        if (run != null) {
                                return run.getSemester();
                        }
                }
                List<DiagnosisRun> closedRuns = diagnosisRunRepository.findByStatus(DiagnosisRunStatus.CLOSED);
                if (!closedRuns.isEmpty()) {
                        return closedRuns.stream()
                                        .map(DiagnosisRun::getSemester)
                                        .filter(Objects::nonNull)
                                        .max(Comparator.comparing(Semester::getSemesterId))
                                        .orElse(null);
                }
                return null;
        }

        private String normalizeSemesterLabel(String value) {
                if (value == null) {
                        return "";
                }
                return value
                                .replaceAll("\\s+", "")
                                .replace("학년", "")
                                .replace("학기", "")
                                .replace("-", "")
                                .toLowerCase();
        }

        private DiagnosisReportSummary buildSummary(
                        long totalTargetCount,
                        long totalResponseCount,
                        BigDecimal totalAverage) {
                return DiagnosisReportSummary.builder()
                                .targetCount(toInt(totalTargetCount))
                                .responseCount(toInt(totalResponseCount))
                                .totalAverage(totalAverage != null ? totalAverage : BigDecimal.ZERO)
                                .build();
        }

        private List<CompetencyStatsTableItem> buildStatsTable(
                        List<Competency> competencies,
                        List<SemesterStudentCompetencySummary> summaries,
                        long totalTargetCount) {
                if (competencies == null || competencies.isEmpty()) {
                        return List.of();
                }
                Map<Long, List<SemesterStudentCompetencySummary>> summaryMap = summaries == null
                                ? Map.of()
                                : summaries.stream()
                                                .filter(Objects::nonNull)
                                                .collect(Collectors.groupingBy(
                                                                s -> s.getCompetency().getCompetencyId()));
                int targetCount = toInt(totalTargetCount);
                return competencies.stream()
                                .map(comp -> {
                                        List<SemesterStudentCompetencySummary> compSummaries = summaryMap
                                                        .getOrDefault(comp.getCompetencyId(), List.of());
                        List<BigDecimal> scores = compSummaries.stream()
                                                        .map(SemesterStudentCompetencySummary::getTotalScore)
                                                        .filter(Objects::nonNull)
                                                        .collect(Collectors.toList());
                                        BigDecimal mean = calculateMean(scores);
                                        BigDecimal median = calculateMedian(scores);
                                        BigDecimal stdDev = calculateStdDev(scores, mean);
                                        LocalDateTime updatedAt = compSummaries.stream()
                                                        .map(SemesterStudentCompetencySummary::getCalculatedAt)
                                                        .filter(Objects::nonNull)
                                                        .max(LocalDateTime::compareTo)
                                                        .orElse(null);
                                        return CompetencyStatsTableItem.builder()
                                                        .competencyName(comp.getName())
                                                        .targetCount(targetCount)
                                                        .responseCount(compSummaries.size())
                                                        .mean(mean)
                                                        .median(median)
                                                        .stdDev(stdDev)
                                                        .updatedAt(updatedAt)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private DiagnosisTrendChart buildDeptTrendChart(
                        List<Dept> targetDepts,
                        List<Competency> competencies,
                        AcademicStatus status) {
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

                Map<Long, Map<Long, Map<Long, BigDecimal>>> deptCompSemesterAvgMap = new HashMap<>();
                if (!semesterIds.isEmpty()) {
                        List<Object[]> rows = summaryRepository
                                        .findDeptSemesterCompetencyTotalScoreAverages(semesterIds, status);
                        for (Object[] row : rows) {
                                Long rowSemesterId = toLong(row[0]);
                                Long rowDeptId = toLong(row[1]);
                                Long rowCompId = toLong(row[2]);
                                if (rowSemesterId == null || rowDeptId == null || rowCompId == null) {
                                        continue;
                                }
                                BigDecimal avgScore = toScaledDecimal(row[3]);
                                deptCompSemesterAvgMap
                                                .computeIfAbsent(rowDeptId, k -> new HashMap<>())
                                                .computeIfAbsent(rowCompId, k -> new HashMap<>())
                                                .put(rowSemesterId, avgScore);
                        }
                }

                List<CompetencyTrendSeries> series = new ArrayList<>();
                for (Dept dept : targetDepts) {
                        Map<Long, Map<Long, BigDecimal>> compMap = deptCompSemesterAvgMap
                                        .getOrDefault(dept.getDeptId(), Map.of());
                        for (Competency comp : competencies) {
                                Map<Long, BigDecimal> semMap = compMap.getOrDefault(comp.getCompetencyId(), Map.of());
                                List<BigDecimal> data = new ArrayList<>();
                                if (semesterIds.isEmpty()) {
                                        data.add(BigDecimal.ZERO);
                                } else {
                                        for (Long semId : semesterIds) {
                                                data.add(semMap.getOrDefault(semId, BigDecimal.ZERO));
                                        }
                                }
                                series.add(CompetencyTrendSeries.builder()
                                                .name(String.format("%s - %s", dept.getDeptName(), comp.getName()))
                                                .data(data)
                                                .build());
                        }
                }

                return DiagnosisTrendChart.builder()
                                .categories(categories)
                                .series(series)
                                .build();
        }

        private BigDecimal calculateMean(List<BigDecimal> values) {
                if (values == null || values.isEmpty()) {
                        return BigDecimal.ZERO;
                }
                BigDecimal sum = values.stream()
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
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

        private int toInt(long value) {
                if (value > Integer.MAX_VALUE) {
                        return Integer.MAX_VALUE;
                }
                if (value < Integer.MIN_VALUE) {
                        return Integer.MIN_VALUE;
                }
                return (int) value;
        }

        private List<Dept> resolveTargetDepts(Long deptId, String deptName) {
                if (deptId != null) {
                        return deptRepository.findAllById(List.of(deptId));
                }
                if (deptName != null && !deptName.isBlank()) {
                        List<Dept> matched = deptRepository.findAll().stream()
                                        .filter(dept -> deptName.equals(dept.getDeptName()))
                                        .collect(Collectors.toList());
                        if (!matched.isEmpty()) {
                                return matched;
                        }
                }
                List<Dept> all = deptRepository.findAll();
                all.sort(Comparator.comparing(
                                Dept::getDeptName,
                                Comparator.nullsLast(String::compareTo)));
                return all;
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
}
