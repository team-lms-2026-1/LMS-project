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
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
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
    private final AlarmCommandService alarmCommandService;

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

        // [검증] 모집 기간 확인
        MentoringRecruitment recruitment = recruitmentRepository.findById(request.getRecruitmentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(recruitment.getRecruitStartAt()) || now.isAfter(recruitment.getRecruitEndAt())) {
            throw new BusinessException(ErrorCode.MENTORING_NOT_OPEN);
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
                .applyReason(request.getReason())
                .build();

        MentoringApplication savedApplication = applicationRepository.save(application);
        notifyNewApplication(savedApplication, recruitment, account);
    }

    private final MentoringMatchingRepository matchingRepository;

    public void match(Long adminId, MentoringMatchingRequest request) {
        MentoringApplication mentorApp = applicationRepository.findById(request.getMentorApplicationId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_APPLICATION_NOT_FOUND));
        MentoringApplication menteeApp = applicationRepository.findById(request.getMenteeApplicationId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_APPLICATION_NOT_FOUND));

        if (menteeApp.getStatus() == MentoringApplicationStatus.MATCHED) {
            throw new BusinessException(ErrorCode.MENTORING_ALREADY_MATCHED);
        }

        MentoringMatching matching = MentoringMatching.builder()
                .recruitmentId(request.getRecruitmentId())
                .mentorApplicationId(request.getMentorApplicationId())
                .menteeApplicationId(request.getMenteeApplicationId())
                .status(MentoringMatchingStatus.ACTIVE)
                .matchedAt(LocalDateTime.now())
                .matchedBy(adminId)
                .build();

        matchingRepository.save(matching);

        // Update statuses
        mentorApp.updateStatus(MentoringApplicationStatus.MATCHED, null, adminId);
        menteeApp.updateStatus(MentoringApplicationStatus.MATCHED, null, adminId);

        notifyApplicationStatus(mentorApp);
        notifyApplicationStatus(menteeApp);
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

        notifyApplicationStatus(application);
    }

    public void createQuestion(Long writerId, MentoringQuestionRequest request) {
        // [검증] 질문은 참여자(멘토 또는 멘티)만 등록 가능
        MentoringMatching matching = matchingRepository.findById(request.getMatchingId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_MATCHING_NOT_FOUND));

        MentoringApplication menteeApp = applicationRepository.findById(matching.getMenteeApplicationId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_APPLICATION_NOT_FOUND));
        MentoringApplication mentorApp = applicationRepository.findById(matching.getMentorApplicationId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_APPLICATION_NOT_FOUND));

        if (!menteeApp.getAccountId().equals(writerId) && !mentorApp.getAccountId().equals(writerId)) {
            throw new BusinessException(ErrorCode.MENTORING_NOT_PARTICIPANT);
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

        notifyQuestionAnswered(question, matching, writerId);
    }

    private void notifyNewApplication(MentoringApplication application, MentoringRecruitment recruitment,
            Account applicant) {
        java.util.List<Account> admins = accountRepository.findAllByAccountType(AccountType.ADMIN);
        if (admins.isEmpty()) {
            return;
        }

        String applicantName = applicant != null ? applicant.getLoginId() : "User";
        String title = "Mentoring application";
        String message = applicantName + " applied for '" + recruitment.getTitle() + "' as "
                + application.getRole().name() + ".";
        String linkUrl = "/admin/mentoring/recruitments/" + recruitment.getRecruitmentId() + "/applications";

        for (Account admin : admins) {
            alarmCommandService.createAlarm(
                    admin.getAccountId(),
                    AlarmType.MENTORING_NEW_APPLICATION,
                    title,
                    message,
                    linkUrl);
        }
    }

    private void notifyApplicationStatus(MentoringApplication application) {
        Long recipientId = application.getAccountId();
        if (recipientId == null) {
            return;
        }

        String title = "Mentoring application status";
        String message = switch (application.getStatus()) {
            case APPROVED -> "Your mentoring application was approved.";
            case REJECTED -> {
                String reason = application.getRejectReason();
                if (reason == null || reason.isBlank()) {
                    yield "Your mentoring application was rejected.";
                }
                yield "Your mentoring application was rejected. Reason: " + reason;
            }
            case MATCHED -> "Your mentoring application was matched.";
            case CANCELED -> "Your mentoring application was canceled.";
            case APPLIED -> "Your mentoring application was received.";
        };

        String linkUrl = "/mentoring/recruitments/" + application.getRecruitmentId();

        alarmCommandService.createAlarm(
                recipientId,
                AlarmType.MENTORING_APPLICATION_STATUS,
                title,
                message,
                linkUrl);
    }

    private void notifyQuestionAnswered(MentoringQuestion question, MentoringMatching matching, Long actorId) {
        Long recipientId = question.getWriterId();
        if (recipientId == null || recipientId.equals(actorId)) {
            return;
        }

        String title = "Mentoring answer";
        String message = "Your mentoring question has been answered.";
        String linkUrl = "/mentoring/matchings/" + matching.getMatchingId() + "/chat";

        alarmCommandService.createAlarm(
                recipientId,
                AlarmType.MENTORING_QUESTION_ANSWERED,
                title,
                message,
                linkUrl);
    }
}
