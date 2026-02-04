package com.teamlms.backend.domain.competency.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.competency.entitiy.DiagnosisRun;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisQuestion;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisTarget;
import com.teamlms.backend.domain.competency.enums.DiagnosisRunStatus;
import com.teamlms.backend.domain.competency.enums.DiagnosisTargetStatus;
import com.teamlms.backend.domain.competency.repository.DiagnosisRunRepository;
import com.teamlms.backend.domain.competency.repository.DiagnosisQuestionRepository;
import com.teamlms.backend.domain.competency.repository.DiagnosisTargetRepository;
import com.teamlms.backend.domain.competency.repository.DiagnosisSubmissionRepository;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    private final com.teamlms.backend.domain.competency.repository.DiagnosisAnswerRepository diagnosisAnswerRepository;
    private final SemesterRepository semesterRepository;
    private final com.teamlms.backend.domain.account.repository.StudentProfileRepository studentProfileRepository;
    private final com.teamlms.backend.domain.competency.service.CompetencySummaryService competencySummaryService;

    /**
     * 진단지 생성
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

        return savedRun.getRunId();
    }

    /**
     * 진단지 수정
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

        // 진단 삭제
        diagnosisRunRepository.delete(diagnosisRun);
    }

    /**
     * 학생 진단 제출
     */
    public void submitDiagnosis(Long diagnosisId, Long accountId,
            com.teamlms.backend.domain.competency.api.dto.DiagnosisSubmitRequest req) {
        // 1. 참여 대상 및 상태 확인
        DiagnosisTarget target = diagnosisTargetRepository.findByRunRunIdAndStudentAccountId(diagnosisId, accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, diagnosisId));

        if (target.getStatus() == DiagnosisTargetStatus.SUBMITTED) {
            // 이미 제출한 경우 예외 처리 (별도 에러코드가 없다면 비즈니스 예외)
            throw new BusinessException(ErrorCode.ALREADY_SUBMITTED_DIAGNOSIS);
        }

        // 2. 제출 정보 생성
        com.teamlms.backend.domain.competency.entitiy.DiagnosisSubmission submission = com.teamlms.backend.domain.competency.entitiy.DiagnosisSubmission
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

        for (com.teamlms.backend.domain.competency.api.dto.DiagnosisSubmitRequest.AnswerSubmitItem item : req
                .getAnswers()) {
            DiagnosisQuestion question = questionMap.get(item.getQuestionId());
            if (question == null)
                continue;

            Boolean isCorrect = null;
            if (question.getQuestionType() == com.teamlms.backend.domain.competency.enums.DiagnosisQuestionType.SHORT) {
                isCorrect = question.getShortAnswerKey() != null && question.getShortAnswerKey().trim()
                        .equalsIgnoreCase(item.getShortText() != null ? item.getShortText().trim() : "");
            }

            com.teamlms.backend.domain.competency.entitiy.DiagnosisAnswer answer = com.teamlms.backend.domain.competency.entitiy.DiagnosisAnswer
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
        // 재학 중인(ENROLLED) 모든 학생을 대상으로 생성
        List<com.teamlms.backend.domain.account.entity.StudentProfile> studentProfiles = studentProfileRepository
                .findAll().stream()
                .filter(p -> p.getAcademicStatus() == com.teamlms.backend.domain.account.enums.AcademicStatus.ENROLLED)
                .collect(java.util.stream.Collectors.toList());

        for (com.teamlms.backend.domain.account.entity.StudentProfile profile : studentProfiles) {
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
            validateWeights(data.getWeights());

            DiagnosisQuestion question = DiagnosisQuestion.builder()
                    .run(diagnosisRun)
                    .domain(data.getDomain())
                    .questionType(data.getQuestionType())
                    .content(data.getText())
                    .sortOrder(data.getOrder() != null ? data.getOrder() : i + 1)
                    .shortAnswerKey(data.getShortAnswerKey())
                    .c1MaxScore(data.getWeights().getOrDefault("C1", 0))
                    .c2MaxScore(data.getWeights().getOrDefault("C2", 0))
                    .c3MaxScore(data.getWeights().getOrDefault("C3", 0))
                    .c4MaxScore(data.getWeights().getOrDefault("C4", 0))
                    .c5MaxScore(data.getWeights().getOrDefault("C5", 0))
                    .c6MaxScore(data.getWeights().getOrDefault("C6", 0))
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
            validateWeights(data.getWeights());

            DiagnosisQuestion question = DiagnosisQuestion.builder()
                    .run(diagnosisRun)
                    .domain(data.getDomain())
                    .questionType(data.getQuestionType())
                    .content(data.getText())
                    .sortOrder(data.getOrder() != null ? data.getOrder() : i + 1)
                    .shortAnswerKey(data.getShortAnswerKey())
                    .c1MaxScore(data.getWeights().getOrDefault("C1", 0))
                    .c2MaxScore(data.getWeights().getOrDefault("C2", 0))
                    .c3MaxScore(data.getWeights().getOrDefault("C3", 0))
                    .c4MaxScore(data.getWeights().getOrDefault("C4", 0))
                    .c5MaxScore(data.getWeights().getOrDefault("C5", 0))
                    .c6MaxScore(data.getWeights().getOrDefault("C6", 0))
                    .build();

            diagnosisQuestionRepository.save(question);
        }
    }

    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BusinessException(ErrorCode.INVALID_DATE_RANGE);
        }
    }

    private void validateWeights(Map<String, Integer> weights) {
        if (weights == null)
            return;
        for (Integer weight : weights.values()) {
            if (weight == null)
                continue;
            if (weight < 0 || weight > 6) {
                throw new BusinessException(ErrorCode.INVALID_COMPETENCY_WEIGHT);
            }
        }
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

    @lombok.Getter
    @lombok.Builder
    public static class QuestionCreateData {
        private com.teamlms.backend.domain.competency.enums.DiagnosisQuestionDomain domain;
        private com.teamlms.backend.domain.competency.enums.DiagnosisQuestionType questionType;
        private String text;
        private Integer order;
        private String shortAnswerKey;
        private Map<String, Integer> weights;
    }

    @lombok.Getter
    @lombok.Builder
    public static class QuestionUpdateData {
        private com.teamlms.backend.domain.competency.enums.DiagnosisQuestionDomain domain;
        private com.teamlms.backend.domain.competency.enums.DiagnosisQuestionType questionType;
        private String text;
        private Integer order;
        private String shortAnswerKey;
        private Map<String, Integer> weights;
    }
}
