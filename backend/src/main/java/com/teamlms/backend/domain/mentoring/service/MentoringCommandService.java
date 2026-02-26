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
import com.teamlms.backend.domain.mentoring.enums.MentoringRole;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class MentoringCommandService {

    private final MentoringRecruitmentRepository recruitmentRepository;
    private final MentoringApplicationRepository applicationRepository;
    private final AlarmCommandService alarmCommandService;

    public Long createRecruitment(MentoringRecruitmentCreateRequest request) {
        LocalDateTime now = LocalDateTime.now();
        MentoringRecruitmentStatus status;

        if (now.isBefore(request.getRecruitStartAt())) {
            status = MentoringRecruitmentStatus.DRAFT;
        } else if (now.isAfter(request.getRecruitEndAt())) {
            status = MentoringRecruitmentStatus.CLOSED;
        } else {
            status = MentoringRecruitmentStatus.OPEN;
        }

        MentoringRecruitment recruitment = MentoringRecruitment.builder()
                .semesterId(request.getSemesterId())
                .title(request.getTitle())
                .description(request.getDescription())
                .recruitStartAt(request.getRecruitStartAt())
                .recruitEndAt(request.getRecruitEndAt())
                .status(status)
                .build();

        return recruitmentRepository.save(recruitment).getRecruitmentId();
    }

    public void updateRecruitment(Long recruitmentId,
            com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentUpdateRequest request) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        MentoringRecruitmentStatus status;

        if (now.isBefore(request.getRecruitStartAt())) {
            status = MentoringRecruitmentStatus.DRAFT;
        } else if (now.isAfter(request.getRecruitEndAt())) {
            status = MentoringRecruitmentStatus.CLOSED;
        } else {
            status = MentoringRecruitmentStatus.OPEN;
        }

        recruitment.update(
                request.getSemesterId(),
                request.getTitle(),
                request.getDescription(),
                request.getRecruitStartAt(),
                request.getRecruitEndAt(),
                status);
    }

    public void deleteRecruitment(Long recruitmentId) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));

        // 1. Remove matchings and Q&A data
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

        // 2. Remove applications
        applicationRepository.deleteAllByRecruitmentId(recruitmentId);

        // 3. Remove recruitment
        recruitmentRepository.delete(recruitment);
    }

    private final com.teamlms.backend.domain.account.repository.AccountRepository accountRepository;

    public void applyMentoring(Long accountId, MentoringApplicationRequest request) {
        // Validate account role matches application role
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

        // Validate recruitment period
        MentoringRecruitment recruitment = recruitmentRepository.findById(request.getRecruitmentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(recruitment.getRecruitStartAt()) || now.isAfter(recruitment.getRecruitEndAt())) {
            throw new BusinessException(ErrorCode.MENTORING_NOT_OPEN);
        }

        // Validate duplicate application
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

        java.util.List<MentoringMatching> matchingsToSave = new java.util.ArrayList<>();
        
        for (Long menteeId : request.getMenteeApplicationIds()) {
            MentoringApplication menteeApp = applicationRepository.findById(menteeId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_APPLICATION_NOT_FOUND));

            if (menteeApp.getStatus() == MentoringApplicationStatus.MATCHED) {
                throw new BusinessException(ErrorCode.MENTORING_ALREADY_MATCHED);
            }

            MentoringMatching matching = MentoringMatching.builder()
                    .recruitmentId(request.getRecruitmentId())
                    .mentorApplicationId(request.getMentorApplicationId())
                    .menteeApplicationId(menteeId)
                    .status(MentoringMatchingStatus.ACTIVE)
                    .matchedAt(LocalDateTime.now())
                    .matchedBy(adminId)
                    .build();

            matchingsToSave.add(matching);
            menteeApp.updateStatus(MentoringApplicationStatus.MATCHED, null, adminId);
        }

        matchingRepository.saveAll(matchingsToSave);
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



        MentoringApplicationStatus newStatus = request.getStatus();
        MentoringApplicationStatus currentStatus = application.getStatus();
        String currentReason = normalizeReason(application.getRejectReason());
        String nextReason = normalizeReason(request.getRejectReason());
        boolean shouldNotify = true;

        if (currentStatus == newStatus) {
            if (newStatus != MentoringApplicationStatus.REJECTED || Objects.equals(currentReason, nextReason)) {
                return;
            }
            shouldNotify = false;
        }

        if (newStatus == MentoringApplicationStatus.REJECTED && nextReason == null) {
            throw new BusinessException(ErrorCode.MENTORING_REJECT_REASON_REQUIRED);
        }

        application.updateStatus(newStatus, nextReason, adminId);

        if (shouldNotify) {
            notifyApplicationStatus(application);
        }
    }

    public void createQuestion(Long writerId, MentoringQuestionRequest request) {
        // Only participants (mentor/mentee) can create questions
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
                .content(request.getContent())
                .build();

        questionRepository.save(question);

        Long recipientId = resolveChatRecipient(mentorApp, menteeApp, writerId);
        sendMentoringChatAlarm(recipientId, matching.getMatchingId(), writerId);
    }

    public void createAnswer(Long writerId, MentoringAnswerRequest request) {
        // Only mentors can create answers
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
                .content(request.getContent())
                .build();

        answerRepository.save(answer);
        sendMentoringChatAlarm(question.getCreatedBy(), matching.getMatchingId(), writerId);
    }

    private void notifyNewApplication(MentoringApplication application, MentoringRecruitment recruitment,
            Account applicant) {
        java.util.List<Account> admins = accountRepository.findAllByAccountType(AccountType.ADMIN);
        if (admins.isEmpty()) {
            return;
        }

        String applicantName = applicant != null ? applicant.getLoginId() : "User";
        String title = "멘토링";
        String roleLabel = application.getRole() == MentoringRole.MENTOR ? "멘토" : "멘티";
        String message = String.format("%s님이 '%s' 멘토링에 %s로 신청했습니다.",
                applicantName, recruitment.getTitle(), roleLabel);
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

        String title = "멘토링";
        String message = switch (application.getStatus()) {
            case APPROVED -> "멘토링 신청이 승인되었습니다.";
            case REJECTED -> {
                String reason = application.getRejectReason();
                if (reason == null || reason.isBlank()) {
                    yield "멘토링 신청이 반려되었습니다.";
                }
                yield "멘토링 신청이 반려되었습니다. 사유: " + reason;
            }
            case MATCHED -> "멘토링이 매칭되었습니다.";
            case CANCELED -> "멘토링 신청이 취소되었습니다.";
            case APPLIED -> "멘토링 신청이 접수되었습니다.";
        };

        String linkUrl = "/mentoring/recruitments/" + application.getRecruitmentId();

        alarmCommandService.createAlarm(
                recipientId,
                AlarmType.MENTORING_APPLICATION_STATUS,
                title,
                message,
                linkUrl);
    }
    private Long resolveChatRecipient(MentoringApplication mentorApp, MentoringApplication menteeApp, Long senderId) {
        if (senderId == null || mentorApp == null || menteeApp == null) {
            return null;
        }

        Long mentorId = mentorApp.getAccountId();
        Long menteeId = menteeApp.getAccountId();

        if (senderId.equals(mentorId)) {
            return menteeId;
        }
        if (senderId.equals(menteeId)) {
            return mentorId;
        }
        return null;
    }

    private void sendMentoringChatAlarm(Long recipientId, Long matchingId, Long senderId) {
        if (recipientId == null || senderId == null || recipientId.equals(senderId)) {
            return;
        }

        String title = "멘토링";
        String message = "멘토링 채팅 메시지가 도착했습니다.";
        String linkUrl = "/mentoring/matchings/" + matchingId + "/chat";

        alarmCommandService.createAlarm(
                recipientId,
                AlarmType.MENTORING_CHAT_MESSAGE,
                title,
                message,
                linkUrl);
    }
    private String normalizeReason(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}


