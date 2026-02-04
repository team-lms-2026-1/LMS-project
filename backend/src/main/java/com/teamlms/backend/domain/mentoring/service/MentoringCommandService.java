package com.teamlms.backend.domain.mentoring.service;

import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringApplicationRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringMatchingRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentCreateRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringStatusUpdateRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringQuestionRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringAnswerRequest;
import com.teamlms.backend.domain.mentoring.enums.MentoringApplicationStatus;
import com.teamlms.backend.domain.mentoring.enums.MentoringMatchingStatus;
import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import com.teamlms.backend.domain.mentoring.entity.MentoringApplication;
import com.teamlms.backend.domain.mentoring.entity.MentoringMatching;
import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import com.teamlms.backend.domain.mentoring.entity.MentoringQuestion;
import com.teamlms.backend.domain.mentoring.entity.MentoringAnswer;
import com.teamlms.backend.domain.mentoring.repository.MentoringApplicationRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringMatchingRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringRecruitmentRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringQuestionRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class MentoringCommandService {

    private final MentoringRecruitmentRepository recruitmentRepository;
    private final MentoringApplicationRepository applicationRepository;

    public Long createRecruitment(Long adminId, MentoringRecruitmentCreateRequest request) {
        MentoringRecruitment recruitment = MentoringRecruitment.builder()
                .semesterId(request.getSemesterId())
                .title(request.getTitle())
                .description(request.getDescription())
                .recruitStartAt(request.getRecruitStartAt())
                .recruitEndAt(request.getRecruitEndAt())
                .status(MentoringRecruitmentStatus.DRAFT) // Default to DRAFT
                .build();

        return recruitmentRepository.save(recruitment).getRecruitmentId();
    }

    public void updateRecruitment(Long adminId, Long recruitmentId,
            com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentUpdateRequest request) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));

        recruitment.update(
                request.getSemesterId(),
                request.getTitle(),
                request.getDescription(),
                request.getRecruitStartAt(),
                request.getRecruitEndAt(),
                request.getStatus());
    }

    public void deleteRecruitment(Long adminId, Long recruitmentId) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));

        // 1. 매칭 및 하위 데이터(Q&A) 삭제
        java.util.List<MentoringMatching> matchings = matchingRepository.findAllByRecruitmentId(recruitmentId);
        if (!matchings.isEmpty()) {
            java.util.List<Long> matchingIds = matchings.stream().map(MentoringMatching::getMatchingId).toList();

            java.util.List<MentoringQuestion> questions = questionRepository.findAllByMatchingIdIn(matchingIds);
            if (!questions.isEmpty()) {
                java.util.List<Long> questionIds = questions.stream().map(MentoringQuestion::getQuestionId).toList();
                answerRepository.deleteAllByQuestionIdIn(questionIds);
                questionRepository.deleteAll(questions);
            }
            matchingRepository.deleteAll(matchings);
        }

        // 2. 신청 내역 삭제
        applicationRepository.deleteAllByRecruitmentId(recruitmentId);

        // 3. 모집 공고 삭제
        recruitmentRepository.delete(recruitment);
    }

    private final com.teamlms.backend.domain.account.repository.AccountRepository accountRepository;

    public void applyMentoring(Long accountId, MentoringApplicationRequest request) {
        // [검증] 계정 타입과 신청 역할의 일치 여부 확인
        com.teamlms.backend.domain.account.entity.Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (request.getRole() == com.teamlms.backend.domain.mentoring.enums.MentoringRole.MENTOR
                && account.getAccountType() != com.teamlms.backend.domain.account.enums.AccountType.PROFESSOR) {
            throw new BusinessException(ErrorCode.MENTORING_INVALID_ROLE_APPLICATION);
        }
        if (request.getRole() == com.teamlms.backend.domain.mentoring.enums.MentoringRole.MENTEE
                && account.getAccountType() != com.teamlms.backend.domain.account.enums.AccountType.STUDENT) {
            throw new BusinessException(ErrorCode.MENTORING_INVALID_ROLE_APPLICATION);
        }

        // [검증] 중복 신청 여부 확인
        if (applicationRepository.existsByRecruitmentIdAndAccountIdAndRole(
                request.getRecruitmentId(), accountId, request.getRole())) {
            throw new BusinessException(ErrorCode.MENTORING_APPLICATION_ALREADY_EXISTS);
        }

        MentoringApplication application = MentoringApplication.builder()
                .recruitmentId(request.getRecruitmentId())
                .accountId(accountId)
                .role(request.getRole())
                .status(MentoringApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .build();

        applicationRepository.save(application);
    }

    private final MentoringMatchingRepository matchingRepository;

    public void match(Long adminId, MentoringMatchingRequest request) {
        MentoringMatching matching = MentoringMatching.builder()
                .recruitmentId(request.getRecruitmentId())
                .mentorApplicationId(request.getMentorApplicationId())
                .menteeApplicationId(request.getMenteeApplicationId())
                .status(MentoringMatchingStatus.ACTIVE)
                .matchedAt(LocalDateTime.now())
                .matchedBy(adminId)
                .build();

        matchingRepository.save(matching);
    }

    private final MentoringQuestionRepository questionRepository;
    private final MentoringAnswerRepository answerRepository;

    public void updateApplicationStatus(Long adminId, Long applicationId, MentoringStatusUpdateRequest request) {
        MentoringApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_APPLICATION_NOT_FOUND));

        // TODO: Validate adminId (권한 체크)

        MentoringApplicationStatus newStatus = request.getStatus();
        if (newStatus == MentoringApplicationStatus.REJECTED
                && (request.getRejectReason() == null || request.getRejectReason().isBlank())) {
            throw new IllegalArgumentException("Reject reason is required for rejection.");
        }

        application.updateStatus(newStatus, request.getRejectReason(), adminId);
    }

    public void createQuestion(Long writerId, MentoringQuestionRequest request) {
        // [검증] 질문은 멘티만 등록 가능
        MentoringMatching matching = matchingRepository.findById(request.getMatchingId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_MATCHING_NOT_FOUND));

        MentoringApplication menteeApp = applicationRepository.findById(matching.getMenteeApplicationId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_APPLICATION_NOT_FOUND));

        if (!menteeApp.getAccountId().equals(writerId)) {
            throw new BusinessException(ErrorCode.MENTORING_NOT_MENTEE);
        }

        MentoringQuestion question = MentoringQuestion.builder()
                .matchingId(request.getMatchingId())
                .writerId(writerId)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        questionRepository.save(question);
    }

    public void createAnswer(Long writerId, MentoringAnswerRequest request) {
        // [검증] 답변은 멘토만 등록 가능
        MentoringQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_QUESTION_NOT_FOUND));

        MentoringMatching matching = matchingRepository.findById(question.getMatchingId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_MATCHING_NOT_FOUND));

        MentoringApplication mentorApp = applicationRepository.findById(matching.getMentorApplicationId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_APPLICATION_NOT_FOUND));

        if (!mentorApp.getAccountId().equals(writerId)) {
            throw new BusinessException(ErrorCode.MENTORING_NOT_MENTOR);
        }

        MentoringAnswer answer = MentoringAnswer.builder()
                .questionId(request.getQuestionId())
                .writerId(writerId)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        answerRepository.save(answer);
    }
}
