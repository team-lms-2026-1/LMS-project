package com.teamlms.backend.domain.competency.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;

import com.teamlms.backend.domain.competency.entitiy.DiagnosisRun;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisQuestion;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisTarget;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisSubmission;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisAnswer;
import com.teamlms.backend.domain.competency.enums.DiagnosisRunStatus;
import com.teamlms.backend.domain.competency.enums.DiagnosisTargetStatus;
import com.teamlms.backend.domain.competency.repository.DiagnosisRunRepository;
import com.teamlms.backend.domain.competency.repository.DiagnosisQuestionRepository;
import com.teamlms.backend.domain.competency.repository.DiagnosisTargetRepository;
import com.teamlms.backend.domain.competency.repository.DiagnosisSubmissionRepository;
import com.teamlms.backend.domain.competency.repository.DiagnosisAnswerRepository;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.enums.AcademicStatus;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.Getter;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

import com.teamlms.backend.domain.competency.api.dto.*;
import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionDomain;
import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionType;

/**
 * 진단 관리 커맨드 서비스 (생성/수정/삭제)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DiagnosisCommandService {

    private final DiagnosisRunRepository diagnosisRunRepository;
    private final DiagnosisQuestionRepository diagnosisQuestionRepository;
    private final DiagnosisTargetRepository diagnosisTargetRepository;
    private final DiagnosisSubmissionRepository diagnosisSubmissionRepository;
    private final DiagnosisAnswerRepository diagnosisAnswerRepository;
    private final SemesterRepository semesterRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompetencySummaryService competencySummaryService;

    /**
     * 진단지 생성 (DTO 버전)
     */
    public Long createDiagnosis(@Valid DiagnosisCreateRequest req) {
        List<QuestionCreateData> questions = mapToQuestionCreateData(req.getProblems(), req.getQuestions());

        return createDiagnosis(
                req.getTitle(),
                req.getSemesterId(),
                req.getTargetGrade(),
                req.getDeptId(),
                req.getStartedAt(),
                req.getEndedAt(),
                questions);
    }

    /**
     * 진단지 생성 (원본)
     */
    public Long createDiagnosis(
            String title,
            Long semesterId,
            Integer targetGrade,
            Long deptId,
            LocalDateTime startedAt,
            LocalDateTime endedAt,
            List<QuestionCreateData> questions) {
        // 학기 존재 검증
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, semesterId));

        // 학기별 진단 중복 검증
        diagnosisRunRepository.findBySemesterSemesterId(semesterId)
                .ifPresent(existing -> {
                    throw new BusinessException(ErrorCode.DUPLICATE_DIAGNOSIS_FOR_SEMESTER);
                });

        // 날짜 유효성 검증
        validateDateRange(startedAt, endedAt);

        // 진단 실행 생성
        DiagnosisRun diagnosisRun = DiagnosisRun.builder()
                .semester(semester)
                .title(title)
                .targetGrade(targetGrade)
                .deptId(deptId)
                .startAt(startedAt)
                .endAt(endedAt)
                .status(DiagnosisRunStatus.DRAFT)
                .build();

        DiagnosisRun savedRun = diagnosisRunRepository.save(diagnosisRun);

        // 문항 생성
        if (questions != null && !questions.isEmpty()) {
            createQuestions(savedRun, questions);
        }

        // 대상자 생성 (DRAFT 상태여도 미리 생성)
        generateTargets(savedRun);

        return savedRun.getRunId();
    }

    /**
     * 진단지 수정 (DTO 버전)
     */
    public void updateDiagnosis(Long diagnosisId, DiagnosisPatchRequest req) {
        DiagnosisRunStatus status = req.getStatus() != null ? DiagnosisRunStatus.valueOf(req.getStatus()) : null;
        List<QuestionUpdateData> questions = mapToQuestionUpdateData(req.getProblems(), req.getQuestions());

        updateDiagnosis(
                diagnosisId,
                req.getTitle(),
                req.getEndedAt(),
                status,
                questions);
    }

    /**
     * 진단지 수정 (원본)
     */
    public void updateDiagnosis(
            Long diagnosisId,
            String title,
            LocalDateTime endedAt,
            DiagnosisRunStatus status,
            List<QuestionUpdateData> questions) {
        DiagnosisRun diagnosisRun = diagnosisRunRepository.findById(diagnosisId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, diagnosisId));

        // 1. 상태 변경 처리 (상태가 바뀔 때만)
        if (status != null && status != diagnosisRun.getStatus()) {
            validateStatusTransition(diagnosisRun.getStatus(), status);
            // DRAFT -> OPEN 시 대상자 생성
            if (status == DiagnosisRunStatus.OPEN && diagnosisRun.getStatus() == DiagnosisRunStatus.DRAFT) {
                generateTargets(diagnosisRun);
            }
        } else {
            status = diagnosisRun.getStatus();
        }

        // 2. 필드 수정 (DRAFT 상태거나, OPEN 상태에서 연장/제목 수정)
        if (diagnosisRun.getStatus() == DiagnosisRunStatus.CLOSED) {
            throw new BusinessException(ErrorCode.CANNOT_MODIFY_CLOSED_DIAGNOSIS);
        }

        LocalDateTime newEndAt = endedAt != null ? endedAt : diagnosisRun.getEndAt();
        validateDateRange(diagnosisRun.getStartAt(), newEndAt);

        DiagnosisRun updated = DiagnosisRun.builder()
                .runId(diagnosisRun.getRunId())
                .semester(diagnosisRun.getSemester())
                .title(title != null ? title : diagnosisRun.getTitle())
                .targetGrade(diagnosisRun.getTargetGrade())
                .deptId(diagnosisRun.getDeptId())
                .startAt(diagnosisRun.getStartAt())
                .endAt(newEndAt)
                .status(status)
                .build();

        diagnosisRunRepository.save(updated);

        // 3. 문항 수정 (DRAFT 상태일 때만 가능)
        if (questions != null) {
            if (diagnosisRun.getStatus() != DiagnosisRunStatus.DRAFT) {
                throw new BusinessException(ErrorCode.CANNOT_MODIFY_QUESTIONS_AFTER_OPEN);
            }
            updateQuestions(diagnosisRun, questions);
        }
    }

    /**
     * 진단 삭제
     */
    public void deleteDiagnosis(Long diagnosisId) {
        DiagnosisRun diagnosisRun = diagnosisRunRepository.findById(diagnosisId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, diagnosisId));

        // 이미 참여한 학생이 있으면 삭제 불가
        long submissionCount = diagnosisSubmissionRepository.countByRunRunId(diagnosisId);
        if (submissionCount > 0) {
            throw new BusinessException(ErrorCode.CANNOT_DELETE_DIAGNOSIS_WITH_SUBMISSIONS);
        }

        // 문항 삭제
        diagnosisQuestionRepository.deleteByRunRunId(diagnosisId);
        diagnosisTargetRepository.deleteByRunRunId(diagnosisId);

        // 진단 삭제
        diagnosisRunRepository.delete(diagnosisRun);
    }

    /**
     * 학생 진단 제출
     */
    public void submitDiagnosis(Long diagnosisId, Long accountId,
            DiagnosisSubmitRequest req) {
        // 1. 참여 대상 및 상태 확인
        DiagnosisTarget target = diagnosisTargetRepository.findByRunRunIdAndStudentAccountId(diagnosisId, accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, diagnosisId));

        if (target.getStatus() == DiagnosisTargetStatus.SUBMITTED) {
            // 이미 제출한 경우 예외 처리 (별도 에러코드가 없다면 비즈니스 예외)
            throw new BusinessException(ErrorCode.ALREADY_SUBMITTED_DIAGNOSIS);
        }

        // 2. 제출 정보 생성
        DiagnosisSubmission submission = DiagnosisSubmission
                .builder()
                .run(target.getRun())
                .student(target.getStudent())
                .submittedAt(LocalDateTime.now())
                .build();

        diagnosisSubmissionRepository.save(submission);

        // 3. 답변 저장
        Map<Long, DiagnosisQuestion> questionMap = diagnosisQuestionRepository
                .findByRunRunIdOrderBySortOrderAsc(diagnosisId)
                .stream().collect(java.util.stream.Collectors.toMap(DiagnosisQuestion::getQuestionId,
                        java.util.function.Function.identity()));

        for (DiagnosisSubmitRequest.AnswerSubmitItem item : req
                .getAnswers()) {
            DiagnosisQuestion question = questionMap.get(item.getQuestionId());
            if (question == null)
                continue;

            Boolean isCorrect = null;
            if (question.getQuestionType() == DiagnosisQuestionType.SHORT) {
                String studentAns = item.getShortText() != null ? item.getShortText().trim() : "";
                String correctAns = question.getShortAnswerKey() != null ? question.getShortAnswerKey().trim() : "";
                isCorrect = !correctAns.isEmpty() && correctAns.equalsIgnoreCase(studentAns);
            }

            DiagnosisAnswer answer = DiagnosisAnswer
                    .builder()
                    .submission(submission)
                    .question(question)
                    .scaleValue(item.getScaleValue())
                    .shortText(item.getShortText())
                    .isCorrect(isCorrect)
                    .build();

            diagnosisAnswerRepository.save(answer);
        }

        // 4. 대상자 상태 업데이트
        DiagnosisTarget updatedTarget = DiagnosisTarget.builder()
                .targetId(target.getTargetId())
                .run(target.getRun())
                .student(target.getStudent())
                .status(DiagnosisTargetStatus.SUBMITTED)
                .registeredAt(target.getRegisteredAt())
                .build();

        diagnosisTargetRepository.save(updatedTarget);

        // 5. 역량 점수 실시간 재계산
        competencySummaryService.recalculateStudentSummary(target.getRun().getSemester().getSemesterId(), accountId);
    }

    // === Private Helper Methods ===

    private void generateTargets(DiagnosisRun diagnosisRun) {
        // 재학 중인(ENROLLED) 학생 중 조건에 맞는 학생 대상 생성
        List<StudentProfile> studentProfiles = studentProfileRepository
                .findAll().stream()
                .filter(p -> p.getAcademicStatus() == AcademicStatus.ENROLLED)
                // 학년 필터 (null이면 전체)
                .filter(p -> diagnosisRun.getTargetGrade() == null || diagnosisRun.getTargetGrade() == 0
                        || p.getGradeLevel().equals(diagnosisRun.getTargetGrade()))
                // 학과 필터 (null이면 전체)
                .filter(p -> diagnosisRun.getDeptId() == null || p.getDeptId().equals(diagnosisRun.getDeptId()))
                .collect(java.util.stream.Collectors.toList());

        for (StudentProfile profile : studentProfiles) {
            // 이미 존재하는지 확인
            if (diagnosisTargetRepository.existsByRunRunIdAndStudentAccountId(diagnosisRun.getRunId(),
                    profile.getAccount().getAccountId())) {
                continue;
            }

            DiagnosisTarget target = DiagnosisTarget.builder()
                    .run(diagnosisRun)
                    .student(profile.getAccount())
                    .status(DiagnosisTargetStatus.PENDING)
                    .registeredAt(LocalDateTime.now())
                    .build();
            diagnosisTargetRepository.save(target);
        }
    }

    private void createQuestions(DiagnosisRun diagnosisRun, List<QuestionCreateData> questions) {
        for (int i = 0; i < questions.size(); i++) {
            QuestionCreateData data = questions.get(i);

            DiagnosisQuestion question = DiagnosisQuestion.builder()
                    .run(diagnosisRun)
                    .domain(data.getDomain())
                    .questionType(data.getQuestionType())
                    .content(data.getText())
                    .sectionTitle(data.getSectionTitle())
                    .sortOrder(data.getOrder() != null ? data.getOrder() : i + 1)
                    .shortAnswerKey(data.getShortAnswerKey())
                    .c1MaxScore(data.getC1() != null ? data.getC1() : 0)
                    .c2MaxScore(data.getC2() != null ? data.getC2() : 0)
                    .c3MaxScore(data.getC3() != null ? data.getC3() : 0)
                    .c4MaxScore(data.getC4() != null ? data.getC4() : 0)
                    .c5MaxScore(data.getC5() != null ? data.getC5() : 0)
                    .c6MaxScore(data.getC6() != null ? data.getC6() : 0)
                    .label1(data.getLabel1())
                    .label2(data.getLabel2())
                    .label3(data.getLabel3())
                    .label4(data.getLabel4())
                    .label5(data.getLabel5())
                    .score1(data.getScore1())
                    .score2(data.getScore2())
                    .score3(data.getScore3())
                    .score4(data.getScore4())
                    .score5(data.getScore5())
                    .build();

            diagnosisQuestionRepository.save(question);
        }
    }

    private void updateQuestions(DiagnosisRun diagnosisRun, List<QuestionUpdateData> questions) {
        // 기존 문항 삭제
        diagnosisQuestionRepository.deleteByRunRunId(diagnosisRun.getRunId());

        // 새 문항 생성
        for (int i = 0; i < questions.size(); i++) {
            QuestionUpdateData data = questions.get(i);

            DiagnosisQuestion question = DiagnosisQuestion.builder()
                    .run(diagnosisRun)
                    .domain(data.getDomain())
                    .questionType(data.getQuestionType())
                    .content(data.getText())
                    .sectionTitle(data.getSectionTitle())
                    .sortOrder(data.getOrder() != null ? data.getOrder() : i + 1)
                    .shortAnswerKey(data.getShortAnswerKey())
                    .c1MaxScore(data.getC1() != null ? data.getC1() : 0)
                    .c2MaxScore(data.getC2() != null ? data.getC2() : 0)
                    .c3MaxScore(data.getC3() != null ? data.getC3() : 0)
                    .c4MaxScore(data.getC4() != null ? data.getC4() : 0)
                    .c5MaxScore(data.getC5() != null ? data.getC5() : 0)
                    .c6MaxScore(data.getC6() != null ? data.getC6() : 0)
                    .label1(data.getLabel1())
                    .label2(data.getLabel2())
                    .label3(data.getLabel3())
                    .label4(data.getLabel4())
                    .label5(data.getLabel5())
                    .score1(data.getScore1())
                    .score2(data.getScore2())
                    .score3(data.getScore3())
                    .score4(data.getScore4())
                    .score5(data.getScore5())
                    .build();

            diagnosisQuestionRepository.save(question);
        }
    }

    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BusinessException(ErrorCode.INVALID_DATE_RANGE);
        }
    }

    private List<QuestionCreateData> mapToQuestionCreateData(List<DiagnosisProblemRequest> problems,
            List<DiagnosisQuestionRequest> directQuestions) {
        List<QuestionCreateData> questions = new ArrayList<>();

        if (problems != null) {
            for (DiagnosisProblemRequest problem : problems) {
                String typeStr = problem.getType().toUpperCase();
                DiagnosisQuestionType problemType = DiagnosisQuestionType.valueOf(typeStr);

                if (problem.getItems() != null && !problem.getItems().isEmpty()) {
                    for (DiagnosisQuestionRequest q : problem.getItems()) {
                        questions.add(QuestionCreateData.builder()
                                .domain(q.getDomain() != null
                                        ? DiagnosisQuestionDomain.valueOf(q.getDomain().toUpperCase())
                                        : (problem.getDomain() != null
                                                ? DiagnosisQuestionDomain.valueOf(problem.getDomain().toUpperCase())
                                                : DiagnosisQuestionDomain.SKILL))
                                .questionType(
                                        q.getType() != null ? DiagnosisQuestionType.valueOf(q.getType().toUpperCase())
                                                : problemType)
                                .sectionTitle(problem.getTitle())
                                .text(q.getText())
                                .order(q.getOrder())
                                .shortAnswerKey(q.getShortAnswerKey() != null ? q.getShortAnswerKey()
                                        : problem.getShortAnswerKey())
                                .c1(q.getC1() != null ? q.getC1() : problem.getC1())
                                .c2(q.getC2() != null ? q.getC2() : problem.getC2())
                                .c3(q.getC3() != null ? q.getC3() : problem.getC3())
                                .c4(q.getC4() != null ? q.getC4() : problem.getC4())
                                .c5(q.getC5() != null ? q.getC5() : problem.getC5())
                                .c6(q.getC6() != null ? q.getC6() : problem.getC6())
                                .label1(q.getLabel1() != null ? q.getLabel1() : problem.getLabel1())
                                .label2(q.getLabel2() != null ? q.getLabel2() : problem.getLabel2())
                                .label3(q.getLabel3() != null ? q.getLabel3() : problem.getLabel3())
                                .label4(q.getLabel4() != null ? q.getLabel4() : problem.getLabel4())
                                .label5(q.getLabel5() != null ? q.getLabel5() : problem.getLabel5())
                                .score1(q.getScore1() != null ? q.getScore1()
                                        : (problem.getScore1() != null ? problem.getScore1() : 1))
                                .score2(q.getScore2() != null ? q.getScore2()
                                        : (problem.getScore2() != null ? problem.getScore2() : 2))
                                .score3(q.getScore3() != null ? q.getScore3()
                                        : (problem.getScore3() != null ? problem.getScore3() : 3))
                                .score4(q.getScore4() != null ? q.getScore4()
                                        : (problem.getScore4() != null ? problem.getScore4() : 4))
                                .score5(q.getScore5() != null ? q.getScore5()
                                        : (problem.getScore5() != null ? problem.getScore5() : 5))
                                .build());
                    }
                } else {
                    questions.add(QuestionCreateData.builder()
                            .domain(problem.getDomain() != null
                                    ? DiagnosisQuestionDomain.valueOf(problem.getDomain().toUpperCase())
                                    : DiagnosisQuestionDomain.SKILL)
                            .questionType(problemType)
                            .sectionTitle(null)
                            .text(problem.getTitle())
                            .order(problem.getOrder())
                            .shortAnswerKey(problem.getShortAnswerKey())
                            .c1(problem.getC1())
                            .c2(problem.getC2())
                            .c3(problem.getC3())
                            .c4(problem.getC4())
                            .c5(problem.getC5())
                            .c6(problem.getC6())
                            .build());
                }
            }
        }

        if (directQuestions != null) {
            for (DiagnosisQuestionRequest q : directQuestions) {
                questions.add(QuestionCreateData.builder()
                        .domain(q.getDomain() != null ? DiagnosisQuestionDomain.valueOf(q.getDomain().toUpperCase())
                                : DiagnosisQuestionDomain.SKILL)
                        .questionType(q.getType() != null ? DiagnosisQuestionType.valueOf(q.getType().toUpperCase())
                                : DiagnosisQuestionType.SCALE)
                        .sectionTitle(null)
                        .text(q.getText())
                        .order(q.getOrder())
                        .shortAnswerKey(q.getShortAnswerKey())
                        .c1(q.getC1())
                        .c2(q.getC2())
                        .c3(q.getC3())
                        .c4(q.getC4())
                        .c5(q.getC5())
                        .c6(q.getC6())
                        .label1(q.getLabel1())
                        .label2(q.getLabel2())
                        .label3(q.getLabel3())
                        .label4(q.getLabel4())
                        .label5(q.getLabel5())
                        .score1(q.getScore1() != null ? q.getScore1() : 1)
                        .score2(q.getScore2() != null ? q.getScore2() : 2)
                        .score3(q.getScore3() != null ? q.getScore3() : 3)
                        .score4(q.getScore4() != null ? q.getScore4() : 4)
                        .score5(q.getScore5() != null ? q.getScore5() : 5)
                        .build());
            }
        }
        return questions;
    }

    private List<QuestionUpdateData> mapToQuestionUpdateData(List<DiagnosisProblemRequest> problems,
            List<DiagnosisQuestionRequest> directQuestions) {
        if (problems == null && directQuestions == null)
            return null;
        List<QuestionUpdateData> questions = new ArrayList<>();

        if (problems != null) {
            for (DiagnosisProblemRequest problem : problems) {
                String typeStr = problem.getType() != null ? problem.getType().toUpperCase() : null;
                DiagnosisQuestionType problemType = typeStr != null ? DiagnosisQuestionType.valueOf(typeStr) : null;

                if (problem.getItems() != null && !problem.getItems().isEmpty()) {
                    for (DiagnosisQuestionRequest q : problem.getItems()) {
                        questions.add(QuestionUpdateData.builder()
                                .domain(q.getDomain() != null
                                        ? DiagnosisQuestionDomain.valueOf(q.getDomain().toUpperCase())
                                        : (problem.getDomain() != null
                                                ? DiagnosisQuestionDomain.valueOf(problem.getDomain().toUpperCase())
                                                : DiagnosisQuestionDomain.SKILL))
                                .questionType(
                                        q.getType() != null ? DiagnosisQuestionType.valueOf(q.getType().toUpperCase())
                                                : problemType)
                                .sectionTitle(problem.getTitle())
                                .text(q.getText())
                                .order(q.getOrder())
                                .shortAnswerKey(q.getShortAnswerKey() != null ? q.getShortAnswerKey()
                                        : problem.getShortAnswerKey())
                                .c1(q.getC1() != null ? q.getC1() : problem.getC1())
                                .c2(q.getC2() != null ? q.getC2() : problem.getC2())
                                .c3(q.getC3() != null ? q.getC3() : problem.getC3())
                                .c4(q.getC4() != null ? q.getC4() : problem.getC4())
                                .c5(q.getC5() != null ? q.getC5() : problem.getC5())
                                .c6(q.getC6() != null ? q.getC6() : problem.getC6())
                                .label1(q.getLabel1() != null ? q.getLabel1() : problem.getLabel1())
                                .label2(q.getLabel2() != null ? q.getLabel2() : problem.getLabel2())
                                .label3(q.getLabel3() != null ? q.getLabel3() : problem.getLabel3())
                                .label4(q.getLabel4() != null ? q.getLabel4() : problem.getLabel4())
                                .label5(q.getLabel5() != null ? q.getLabel5() : problem.getLabel5())
                                .score1(q.getScore1() != null ? q.getScore1()
                                        : (problem.getScore1() != null ? problem.getScore1() : 1))
                                .score2(q.getScore2() != null ? q.getScore2()
                                        : (problem.getScore2() != null ? problem.getScore2() : 2))
                                .score3(q.getScore3() != null ? q.getScore3()
                                        : (problem.getScore3() != null ? problem.getScore3() : 3))
                                .score4(q.getScore4() != null ? q.getScore4()
                                        : (problem.getScore4() != null ? problem.getScore4() : 4))
                                .score5(q.getScore5() != null ? q.getScore5()
                                        : (problem.getScore5() != null ? problem.getScore5() : 5))
                                .build());
                    }
                } else {
                    questions.add(QuestionUpdateData.builder()
                            .domain(problem.getDomain() != null
                                    ? DiagnosisQuestionDomain.valueOf(problem.getDomain().toUpperCase())
                                    : DiagnosisQuestionDomain.SKILL)
                            .questionType(problemType)
                            .sectionTitle(null)
                            .text(problem.getTitle())
                            .order(problem.getOrder())
                            .shortAnswerKey(problem.getShortAnswerKey())
                            .c1(problem.getC1())
                            .c2(problem.getC2())
                            .c3(problem.getC3())
                            .c4(problem.getC4())
                            .c5(problem.getC5())
                            .c6(problem.getC6())
                            .build());
                }
            }
        }

        if (directQuestions != null) {
            for (DiagnosisQuestionRequest q : directQuestions) {
                questions.add(QuestionUpdateData.builder()
                        .domain(q.getDomain() != null ? DiagnosisQuestionDomain.valueOf(q.getDomain().toUpperCase())
                                : DiagnosisQuestionDomain.SKILL)
                        .questionType(q.getType() != null ? DiagnosisQuestionType.valueOf(q.getType().toUpperCase())
                                : DiagnosisQuestionType.SCALE)
                        .sectionTitle(null)
                        .text(q.getText())
                        .order(q.getOrder())
                        .shortAnswerKey(q.getShortAnswerKey())
                        .c1(q.getC1())
                        .c2(q.getC2())
                        .c3(q.getC3())
                        .c4(q.getC4())
                        .c5(q.getC5())
                        .c6(q.getC6())
                        .label1(q.getLabel1())
                        .label2(q.getLabel2())
                        .label3(q.getLabel3())
                        .label4(q.getLabel4())
                        .label5(q.getLabel5())
                        .score1(q.getScore1() != null ? q.getScore1() : 1)
                        .score2(q.getScore2() != null ? q.getScore2() : 2)
                        .score3(q.getScore3() != null ? q.getScore3() : 3)
                        .score4(q.getScore4() != null ? q.getScore4() : 4)
                        .score5(q.getScore5() != null ? q.getScore5() : 5)
                        .build());
            }
        }
        return questions;
    }

    private void validateStatusTransition(DiagnosisRunStatus current, DiagnosisRunStatus next) {
        if (current == DiagnosisRunStatus.CLOSED) {
            throw new BusinessException(ErrorCode.CANNOT_MODIFY_CLOSED_DIAGNOSIS);
        }
        if (current == DiagnosisRunStatus.OPEN && next == DiagnosisRunStatus.DRAFT) {
            throw new BusinessException(ErrorCode.CANNOT_MODIFY_QUESTIONS_AFTER_OPEN);
        }
    }

    // === Inner Classes for Data Transfer ===

    @Getter
    @Builder
    public static class QuestionCreateData {
        private DiagnosisQuestionDomain domain;
        private DiagnosisQuestionType questionType;
        private String sectionTitle;
        private String text;
        private Integer order;
        private String shortAnswerKey;
        private Integer c1;
        private Integer c2;
        private Integer c3;
        private Integer c4;
        private Integer c5;
        private Integer c6;

        private String label1;
        private String label2;
        private String label3;
        private String label4;
        private String label5;

        private Integer score1;
        private Integer score2;
        private Integer score3;
        private Integer score4;
        private Integer score5;
    }

    @Getter
    @Builder
    public static class QuestionUpdateData {
        private DiagnosisQuestionDomain domain;
        private DiagnosisQuestionType questionType;
        private String sectionTitle;
        private String text;
        private Integer order;
        private String shortAnswerKey;
        private Integer c1;
        private Integer c2;
        private Integer c3;
        private Integer c4;
        private Integer c5;
        private Integer c6;

        private String label1;
        private String label2;
        private String label3;
        private String label4;
        private String label5;

        private Integer score1;
        private Integer score2;
        private Integer score3;
        private Integer score4;
        private Integer score5;
    }

}
