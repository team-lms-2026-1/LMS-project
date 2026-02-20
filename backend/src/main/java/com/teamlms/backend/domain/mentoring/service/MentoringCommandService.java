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

        // 1. Îß§Ïπ≠ Î∞??òÏúÑ ?∞Ïù¥??Q&A) ??†ú
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

        // 2. ?†Ï≤≠ ?¥Ïó≠ ??†ú
        applicationRepository.deleteAllByRecruitmentId(recruitmentId);

        // 3. Î™®Ïßë Í≥µÍ≥† ??†ú
        recruitmentRepository.delete(recruitment);
    }

    private final com.teamlms.backend.domain.account.repository.AccountRepository accountRepository;

    public void applyMentoring(Long accountId, MentoringApplicationRequest request) {
        // [Í≤ÄÏ¶? Í≥ÑÏ†ï ?Ä?ÖÍ≥º ?†Ï≤≠ ??ï†???ºÏπò ?¨Î? ?ïÏù∏
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

        // [Í≤ÄÏ¶? Î™®Ïßë Í∏∞Í∞Ñ ?ïÏù∏
        MentoringRecruitment recruitment = recruitmentRepository.findById(request.getRecruitmentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(recruitment.getRecruitStartAt()) || now.isAfter(recruitment.getRecruitEndAt())) {
            throw new BusinessException(ErrorCode.MENTORING_NOT_OPEN);
        }

        // [Í≤ÄÏ¶? Ï§ëÎ≥µ ?†Ï≤≠ ?¨Î? ?ïÏù∏
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
        // [Í≤ÄÏ¶? ÏßàÎ¨∏?Ä Ï∞∏Ïó¨??Î©òÌÜ† ?êÎäî Î©òÌã∞)Îß??±Î°ù Í∞Ä??
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
        // [Í≤ÄÏ¶? ?µÎ??Ä Î©òÌÜ†Îß??±Î°ù Í∞Ä??
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
        sendMentoringChatAlarm(question.getWriterId(), matching.getMatchingId(), writerId);
    }

    private void notifyNewApplication(MentoringApplication application, MentoringRecruitment recruitment,
            Account applicant) {
        java.util.List<Account> admins = accountRepository.findAllByAccountType(AccountType.ADMIN);
        if (admins.isEmpty()) {
            return;
        }

        String applicantName = applicant != null ? applicant.getLoginId() : "User";
        String title = "∏‡≈‰∏µ";
        String roleLabel = application.getRole() == MentoringRole.MENTOR ? "∏‡≈‰" : "∏‡∆º";
        String message = String.format("%s¥‘¿Ã '%s' ∏‡≈‰∏µø° %s∑Œ Ω≈√ª«ﬂΩ¿¥œ¥Ÿ.",
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

        String title = "∏‡≈‰∏µ";
        String message = switch (application.getStatus()) {
            case APPROVED -> "∏‡≈‰∏µ Ω≈√ª¿Ã Ω¬¿Œµ«æ˙Ω¿¥œ¥Ÿ.";
            case REJECTED -> {
                String reason = application.getRejectReason();
                if (reason == null || reason.isBlank()) {
                    yield "∏‡≈‰∏µ Ω≈√ª¿Ã π›∑¡µ«æ˙Ω¿¥œ¥Ÿ.";
                }
                yield "∏‡≈‰∏µ Ω≈√ª¿Ã π›∑¡µ«æ˙Ω¿¥œ¥Ÿ. ªÁ¿Ø: " + reason;
            }
            case MATCHED -> "∏‡≈‰∏µ¿Ã ∏≈ƒ™µ«æ˙Ω¿¥œ¥Ÿ.";
            case CANCELED -> "∏‡≈‰∏µ Ω≈√ª¿Ã √Îº“µ«æ˙Ω¿¥œ¥Ÿ.";
            case APPLIED -> "∏‡≈‰∏µ Ω≈√ª¿Ã ¡¢ºˆµ«æ˙Ω¿¥œ¥Ÿ.";
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

        String title = "∏‡≈‰∏µ";
        String message = "∏‡≈‰∏µ √§∆√ ∏ﬁΩ√¡ˆ∞° µµ¬¯«ﬂΩ¿¥œ¥Ÿ.";
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

