package com.teamlms.backend.domain.competency.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.competency.entitiy.*;
import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionDomain;
import com.teamlms.backend.domain.competency.repository.*;
import com.teamlms.backend.domain.curricular.entity.Enrollment;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.curricular.repository.EnrollmentRepository;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionCompletionRepository;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 역량 요약 및 통계 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CompetencySummaryService {

    private final SemesterStudentCompetencySummaryRepository summaryRepository;
    private final SemesterCompetencyCohortStatRepository statRepository;
    private final CompetencyRepository competencyRepository;
    private final SemesterRepository semesterRepository;
    private final AccountRepository accountRepository;
    private final StudentProfileRepository studentProfileRepository;

    private final DiagnosisRunRepository diagnosisRunRepository;
    private final DiagnosisSubmissionRepository diagnosisSubmissionRepository;
    private final DiagnosisAnswerRepository diagnosisAnswerRepository;

    private final EnrollmentRepository enrollmentRepository;
    private final CurricularOfferingCompetencyMapRepository curricularCompetencyMapRepository;

    private final ExtraCurricularOfferingRepository extraOfferingRepository;
    private final ExtraCurricularApplicationRepository extraApplicationRepository;
    private final ExtraCurricularSessionCompletionRepository extraCompletionRepository;

    // ✅ offering 기준 맵 레포로 교체
    private final ExtraCurricularOfferingCompetencyMapRepository extraOfferingCompetencyMapRepository;

    /**
     * 학생별 학기별 역량 요약 생성/업데이트
     */
    public void updateStudentCompetencySummary(
            Long semesterId,
            Long studentAccountId,
            Long competencyId,
            BigDecimal diagnosisSkillScore,
            BigDecimal diagnosisAptitudeScore,
            BigDecimal curricularScore,
            BigDecimal extraScore,
            BigDecimal selfExtraScore
    ) {
        Competency competency = competencyRepository.findById(competencyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMPETENCY_NOT_FOUND, competencyId));

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, semesterId));

        Account student = accountRepository.findById(studentAccountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, studentAccountId));

        SemesterStudentCompetencySummary summary = summaryRepository
                .findBySemesterSemesterIdAndStudentAccountIdAndCompetencyCompetencyId(
                        semesterId, studentAccountId, competencyId
                )
                .orElse(null);

        BigDecimal diagnosisScore = diagnosisSkillScore.add(diagnosisAptitudeScore);
        BigDecimal totalScore = diagnosisScore
                .add(curricularScore)
                .add(extraScore)
                .add(selfExtraScore);

        if (summary == null) {
            summary = SemesterStudentCompetencySummary.builder()
                    .semester(semester)
                    .student(student)
                    .competency(competency)
                    .diagnosisSkillScore(diagnosisSkillScore)
                    .diagnosisAptitudeScore(diagnosisAptitudeScore)
                    .diagnosisScore(diagnosisScore)
                    .curricularScore(curricularScore)
                    .extraScore(extraScore)
                    .selfExtraScore(selfExtraScore)
                    .totalScore(totalScore)
                    .calculatedAt(LocalDateTime.now())
                    .build();
        } else {
            // 기존 스타일 유지(빌더로 재생성) - 원하면 setter/update 메서드로 바꿔도 됨
            summary = SemesterStudentCompetencySummary.builder()
                    .summaryId(summary.getSummaryId())
                    .semester(summary.getSemester())
                    .student(summary.getStudent())
                    .competency(competency)
                    .diagnosisSkillScore(diagnosisSkillScore)
                    .diagnosisAptitudeScore(diagnosisAptitudeScore)
                    .diagnosisScore(diagnosisScore)
                    .curricularScore(curricularScore)
                    .extraScore(extraScore)
                    .selfExtraScore(selfExtraScore)
                    .totalScore(totalScore)
                    .calculatedAt(LocalDateTime.now())
                    .build();
        }

        summaryRepository.save(summary);
    }

    /**
     * 특정 학생의 학기별 역량 요약 재계산
     */
    @Transactional
    public void recalculateStudentSummary(Long semesterId, Long studentAccountId) {

        List<Competency> competencies = competencyRepository.findAll();
        DiagnosisRun run = diagnosisRunRepository.findBySemesterSemesterId(semesterId).orElse(null);

        for (Competency comp : competencies) {

            String code = comp.getCode();

            // 1) 진단 점수
            BigDecimal diagSkill = BigDecimal.ZERO;
            BigDecimal diagAptitude = BigDecimal.ZERO;

            if (run != null) {
                var submission = diagnosisSubmissionRepository
                        .findByRunRunIdAndStudentAccountId(run.getRunId(), studentAccountId);

                if (submission.isPresent()) {
                    List<DiagnosisAnswer> answers = diagnosisAnswerRepository
                            .findBySubmissionSubmissionId(submission.get().getSubmissionId());

                    for (DiagnosisAnswer ans : answers) {
                        DiagnosisQuestion q = ans.getQuestion();
                        int weight = getQuestionWeight(q, code);

                        if (weight > 0 && ans.getScaleValue() != null) {
                            BigDecimal score = BigDecimal.valueOf(ans.getScaleValue() * (long) weight);
                            if (q.getDomain() == DiagnosisQuestionDomain.SKILL) diagSkill = diagSkill.add(score);
                            else diagAptitude = diagAptitude.add(score);
                        }
                    }
                }
            }

            // 2) 교과 점수
            BigDecimal curricular = BigDecimal.ZERO;

            List<Enrollment> enrollments = enrollmentRepository
                    .findByStudentAccountIdAndSemesterId(studentAccountId, semesterId);

            for (Enrollment e : enrollments) {
                if (e.getRawScore() == null) continue;

                var weightMap = curricularCompetencyMapRepository
                        .findByIdOfferingIdAndIdCompetencyId(e.getOfferingId(), comp.getCompetencyId());

                if (weightMap.isPresent()) {
                    curricular = curricular.add(
                            BigDecimal.valueOf((long) e.getRawScore() * weightMap.get().getWeight())
                    );
                }
            }

            // 3) 비교과 점수 (✅ offering 기준 역량맵으로 계산)
            BigDecimal extra = BigDecimal.ZERO;

            var applications = extraApplicationRepository
                    .findByStudentAccountIdAndSemesterId(studentAccountId, semesterId);

            for (var app : applications) {

                var completionList = extraCompletionRepository.findByApplicationId(app.getApplicationId());
                if (completionList.isEmpty()) continue;

                ExtraCurricularOffering offering = extraOfferingRepository
                        .findById(app.getExtraOfferingId())
                        .orElse(null);
                if (offering == null) continue;

                // ✅ 핵심 수정: offeringId를 그대로 사용
                var weightMap = extraOfferingCompetencyMapRepository
                        .findByIdExtraOfferingIdAndIdCompetencyId(
                                offering.getExtraOfferingId(),
                                comp.getCompetencyId()
                        );

                if (weightMap.isPresent()) {
                    long totalPoints = completionList.stream()
                            .mapToLong(com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionCompletion::getEarnedPoint)
                            .sum();

                    extra = extra.add(
                            BigDecimal.valueOf(totalPoints * weightMap.get().getWeight())
                    );
                }
            }

            // 4) 저장
            updateStudentCompetencySummary(
                    semesterId,
                    studentAccountId,
                    comp.getCompetencyId(),
                    diagSkill,
                    diagAptitude,
                    curricular,
                    extra,
                    BigDecimal.ZERO
            );
        }
    }

    /**
     * 학기별 전체 학생 역량 요약 재계산
     */
    @Transactional
    public void recalculateAllSummaries(Long semesterId) {

        List<Competency> competencies = competencyRepository.findAll();
        List<com.teamlms.backend.domain.account.entity.StudentProfile> students = studentProfileRepository.findAll();

        DiagnosisRun run = diagnosisRunRepository.findBySemesterSemesterId(semesterId).orElse(null);

        for (com.teamlms.backend.domain.account.entity.StudentProfile student : students) {

            Long studentId = student.getAccountId();

            for (Competency comp : competencies) {

                String code = comp.getCode();

                // 1) 진단 점수
                BigDecimal diagSkill = BigDecimal.ZERO;
                BigDecimal diagAptitude = BigDecimal.ZERO;

                if (run != null) {
                    var submission = diagnosisSubmissionRepository
                            .findByRunRunIdAndStudentAccountId(run.getRunId(), studentId);

                    if (submission.isPresent()) {
                        List<DiagnosisAnswer> answers = diagnosisAnswerRepository
                                .findBySubmissionSubmissionId(submission.get().getSubmissionId());

                        for (DiagnosisAnswer ans : answers) {
                            DiagnosisQuestion q = ans.getQuestion();
                            int weight = getQuestionWeight(q, code);

                            if (weight > 0 && ans.getScaleValue() != null) {
                                BigDecimal score = BigDecimal.valueOf(ans.getScaleValue() * (long) weight);
                                if (q.getDomain() == DiagnosisQuestionDomain.SKILL) diagSkill = diagSkill.add(score);
                                else diagAptitude = diagAptitude.add(score);
                            }
                        }
                    }
                }

                // 2) 교과 점수
                BigDecimal curricular = BigDecimal.ZERO;

                List<Enrollment> enrollments = enrollmentRepository
                        .findByStudentAccountIdAndSemesterId(studentId, semesterId);

                for (Enrollment e : enrollments) {
                    if (e.getRawScore() == null) continue;

                    var weightMap = curricularCompetencyMapRepository
                            .findByIdOfferingIdAndIdCompetencyId(e.getOfferingId(), comp.getCompetencyId());

                    if (weightMap.isPresent()) {
                        curricular = curricular.add(
                                BigDecimal.valueOf((long) e.getRawScore() * weightMap.get().getWeight())
                        );
                    }
                }

                // 3) 비교과 점수 (✅ offering 기준)
                BigDecimal extra = BigDecimal.ZERO;

                var applications = extraApplicationRepository
                        .findByStudentAccountIdAndSemesterId(studentId, semesterId);

                for (var app : applications) {

                    var completionList = extraCompletionRepository.findByApplicationId(app.getApplicationId());
                    if (completionList.isEmpty()) continue;

                    ExtraCurricularOffering offering = extraOfferingRepository
                            .findById(app.getExtraOfferingId())
                            .orElse(null);
                    if (offering == null) continue;

                    var weightMap = extraOfferingCompetencyMapRepository
                            .findByIdExtraOfferingIdAndIdCompetencyId(
                                    offering.getExtraOfferingId(),
                                    comp.getCompetencyId()
                            );

                    if (weightMap.isPresent()) {
                        long totalPoints = completionList.stream()
                                .mapToLong(com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionCompletion::getEarnedPoint)
                                .sum();

                        extra = extra.add(
                                BigDecimal.valueOf(totalPoints * weightMap.get().getWeight())
                        );
                    }
                }

                // 4) 저장
                updateStudentCompetencySummary(
                        semesterId,
                        studentId,
                        comp.getCompetencyId(),
                        diagSkill,
                        diagAptitude,
                        curricular,
                        extra,
                        BigDecimal.ZERO
                );
            }
        }

        // 학기별 전체 통계
        calculateCohortStatistics(semesterId);
    }

    /**
     * 특정 학기의 역량별 코호트 통계 계산
     */
    @Transactional
    public void calculateCohortStatistics(Long semesterId) {

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, semesterId));

        List<Competency> competencies = competencyRepository.findAll();
        List<SemesterStudentCompetencySummary> allSummaries = summaryRepository.findBySemesterSemesterId(semesterId);

        Map<Long, List<SemesterStudentCompetencySummary>> groupedByComp = allSummaries.stream()
                .collect(Collectors.groupingBy(s -> s.getCompetency().getCompetencyId()));

        for (Competency comp : competencies) {

            List<SemesterStudentCompetencySummary> compSummaries =
                    groupedByComp.getOrDefault(comp.getCompetencyId(), List.of());

            int totalTarget = (int) studentProfileRepository.count();
            int calculatedCount = compSummaries.size();

            BigDecimal mean = BigDecimal.ZERO;
            BigDecimal median = BigDecimal.ZERO;
            BigDecimal stddev = BigDecimal.ZERO;
            BigDecimal maxScore = BigDecimal.ZERO;

            if (!compSummaries.isEmpty()) {

                BigDecimal totalScore = compSummaries.stream()
                        .map(SemesterStudentCompetencySummary::getTotalScore)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                mean = totalScore.divide(BigDecimal.valueOf(calculatedCount), 2, RoundingMode.HALF_UP);

                List<BigDecimal> scores = compSummaries.stream()
                        .map(SemesterStudentCompetencySummary::getTotalScore)
                        .sorted()
                        .collect(Collectors.toList());

                int size = scores.size();

                if (size % 2 == 0) {
                    median = scores.get(size / 2 - 1).add(scores.get(size / 2))
                            .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                } else {
                    median = scores.get(size / 2);
                }

                double meanDouble = mean.doubleValue();
                double sumSquaredDiff = 0;

                for (BigDecimal score : scores) {
                    double diff = score.doubleValue() - meanDouble;
                    sumSquaredDiff += diff * diff;
                }

                double variance = sumSquaredDiff / size;
                stddev = BigDecimal.valueOf(Math.sqrt(variance)).setScale(2, RoundingMode.HALF_UP);

                maxScore = scores.get(size - 1);
            }

            SemesterCompetencyCohortStat stat = statRepository
                    .findBySemesterSemesterIdAndCompetencyCompetencyId(semesterId, comp.getCompetencyId())
                    .orElse(null);

            if (stat == null) {
                stat = SemesterCompetencyCohortStat.builder()
                        .semester(semester)
                        .competency(comp)
                        .targetCount(totalTarget)
                        .calculatedCount(calculatedCount)
                        .mean(mean)
                        .median(median)
                        .stddev(stddev)
                        .maxScore(maxScore)
                        .calculatedAt(LocalDateTime.now())
                        .build();
            } else {
                stat = SemesterCompetencyCohortStat.builder()
                        .statId(stat.getStatId())
                        .semester(stat.getSemester())
                        .competency(stat.getCompetency())
                        .targetCount(totalTarget)
                        .calculatedCount(calculatedCount)
                        .mean(mean)
                        .median(median)
                        .stddev(stddev)
                        .maxScore(maxScore)
                        .calculatedAt(LocalDateTime.now())
                        .build();
            }

            statRepository.save(stat);
        }
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
}
