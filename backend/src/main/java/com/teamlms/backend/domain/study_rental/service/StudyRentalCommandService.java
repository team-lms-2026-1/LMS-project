package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.global.security.principal.AuthUser;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.study_rental.api.dto.RentalApplyRequest;
import com.teamlms.backend.domain.study_rental.api.dto.RentalProcessRequest;
import com.teamlms.backend.domain.study_rental.entity.StudyRoom;
import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRentalRepository;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRepository;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyRentalCommandService {

    private final StudyRoomRentalRepository rentalRepository;
    private final StudyRoomRepository roomRepository;
    private final AccountRepository accountRepository; // 요청자/처리자 조회용
    private final AlarmCommandService alarmCommandService;

    // 1. 예약 신청
    public void applyRental(Object principal, RentalApplyRequest req) {
        // 1. ID 추출 로직 위임
        Long accountId = extractAccountId(principal);

        Account applicant = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        StudyRoom room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        // 날짜 + 시간 결합
        LocalDateTime startAt = LocalDateTime.of(req.getRentalDate(), req.getStartTime());
        LocalDateTime endAt = LocalDateTime.of(req.getRentalDate(), req.getEndTime());

        // 시간 검증
        if (startAt.isAfter(endAt)) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_NOT_ST_TIME);
        }

        // 중복 예약 확인
        boolean isOverlapped = !rentalRepository.findOverlappingRentals(
                room.getId(),
                RentalStatus.APPROVED,
                startAt,
                endAt
        ).isEmpty();

        if (isOverlapped) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_NOT_TIME);
        }

        StudyRoomRental rental = StudyRoomRental.builder()
                .studyRoom(room)
                .applicant(applicant)
                .startAt(startAt)
                .endAt(endAt)
                .status(RentalStatus.REQUESTED)
                .build();

        rentalRepository.save(rental);
        notifyRentalRequested(rental);
    }

    // 2. 예약 승인/반려 처리
    public void processRental(Object principal, Long rentalId, RentalProcessRequest req) {
        // 1. Principal에서 ID 추출 로직을 메서드로 위임
        Long accountId = extractAccountId(principal);

        Account processor = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        StudyRoomRental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        RentalStatus previousStatus = rental.getStatus();

        if (req.getStatus() == RentalStatus.APPROVED) {
            boolean isOverlapped = !rentalRepository.findOverlappingRentals(
                    rental.getStudyRoom().getId(),
                    RentalStatus.APPROVED,
                    rental.getStartAt(),
                    rental.getEndAt()
            ).isEmpty();

            if (isOverlapped) {
                throw new BusinessException(ErrorCode.STUDY_RENTAL_NOT_TIME);
            }
        }

        rental.process(req.getStatus(), processor, req.getRejectionReason());

        if (previousStatus != RentalStatus.APPROVED && req.getStatus() == RentalStatus.APPROVED) {
            notifyRentalApproved(rental);
        }

        if (previousStatus != RentalStatus.REJECTED && req.getStatus() == RentalStatus.REJECTED) {
            notifyRentalRejected(rental);
        }
    }

    // 3. 예약 취소 (Principal 직접 받음)
    public void cancelRental(Object principal, Long rentalId) {
        // 1. ID 추출 (Controller 로직 제거)
        Long accountId = extractAccountId(principal);

        StudyRoomRental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_NOT_FOUND));

        // 2. 본인 확인
        if (!rental.getApplicant().getAccountId().equals(accountId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        // 3. 상태 확인
        if (rental.getStatus() == RentalStatus.REJECTED
                || rental.getStatus() == RentalStatus.CANCELED) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_NOT_UPDATE);
        }

        // 4. 취소 처리
        rental.cancel();
    }

    // ==========================================================
    // Private Helper Method: Principal 타입 체크 및 ID 추출
    // ==========================================================
    private Long extractAccountId(Object principal) {
        if (principal == null) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);
        }

        if (principal instanceof AuthUser authUser) {
            return authUser.getAccountId();
        } else if (principal instanceof Account account) {
            return account.getAccountId();
        } else if (principal instanceof UserDetails userDetails) {
            return Long.parseLong(userDetails.getUsername());
        } else if (principal instanceof Long id) {
            return id;
        } else if (principal instanceof String s) {
            return Long.parseLong(s);
        }

        throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);
    }

    private void notifyRentalApproved(StudyRoomRental rental) {
        if (rental == null || rental.getApplicant() == null) return;

        Long recipientId = rental.getApplicant().getAccountId();
        if (recipientId == null) return;

        String titleKey = "study.rental.alarm.title";
        String details = buildRentalDetails(rental);

        String messageKey = (details != null && !details.isBlank())
                ? "study.rental.alarm.approved.with_details"
                : "study.rental.alarm.approved";

        Object[] messageArgs = (details != null && !details.isBlank())
                ? new Object[]{details}
                : null;

        alarmCommandService.createAlarmI18n(
                recipientId,
                AlarmType.STUDY_RENTAL_APPROVED,
                titleKey,
                messageKey,
                messageArgs,
                "/study-space/spaces-rentals",
                null,
                null
        );
    }

    private void notifyRentalRejected(StudyRoomRental rental) {
        if (rental == null || rental.getApplicant() == null) return;

        Long recipientId = rental.getApplicant().getAccountId();
        if (recipientId == null) return;

        String titleKey = "study.rental.alarm.title";
        String details = buildRentalDetails(rental);
        String reason = rental.getRejectionReason();

        String messageKey;
        Object[] messageArgs = null;

        if (reason != null && !reason.isBlank() && details != null && !details.isBlank()) {
            messageKey = "study.rental.alarm.rejected.with_reason_details";
            messageArgs = new Object[]{reason, details};
        } else if (reason != null && !reason.isBlank()) {
            messageKey = "study.rental.alarm.rejected.with_reason";
            messageArgs = new Object[]{reason};
        } else if (details != null && !details.isBlank()) {
            messageKey = "study.rental.alarm.rejected.with_details";
            messageArgs = new Object[]{details};
        } else {
            messageKey = "study.rental.alarm.rejected";
        }

        alarmCommandService.createAlarmI18n(
                recipientId,
                AlarmType.STUDY_RENTAL_REJECTED,
                titleKey,
                messageKey,
                messageArgs,
                "/study-space/spaces-rentals",
                null,
                null
        );
    }

    private void notifyRentalRequested(StudyRoomRental rental) {
        if (rental == null) return;

        List<Account> admins = accountRepository.findAllByPermissionCodes(List.of("RENTAL_MANAGE"));
        if (admins.isEmpty()) {
            admins = accountRepository.findAllByAccountType(AccountType.ADMIN);
        }
        if (admins.isEmpty()) return;

        Long applicantId = rental.getApplicant() != null
                ? rental.getApplicant().getAccountId()
                : null;

        String titleKey = "study.rental.alarm.title";
        String details = buildRentalDetails(rental);

        String messageKey = (details != null && !details.isBlank())
                ? "study.rental.alarm.requested.with_details"
                : "study.rental.alarm.requested";

        Object[] messageArgs = (details != null && !details.isBlank())
                ? new Object[]{details}
                : null;

        for (Account admin : admins) {
            if (admin.getAccountId() == null
                    || admin.getAccountId().equals(applicantId)) {
                continue;
            }

            alarmCommandService.createAlarmI18n(
                    admin.getAccountId(),
                    AlarmType.STUDY_RENTAL_REQUESTED,
                    titleKey,
                    messageKey,
                    messageArgs,
                    "/study-space/spaces-rentals",
                    null,
                    null
            );
        }
    }

    private String buildRentalDetails(StudyRoomRental rental) {
        if (rental == null) return "";

        String spaceName = rental.getStudyRoom() != null
                && rental.getStudyRoom().getStudySpace() != null
                ? rental.getStudyRoom().getStudySpace().getSpaceName()
                : "";

        String roomName = rental.getStudyRoom() != null
                ? rental.getStudyRoom().getRoomName()
                : "";

        String period = formatRentalPeriod(rental.getStartAt(), rental.getEndAt());

        StringBuilder details = new StringBuilder(spaceName);
        if (roomName != null && !roomName.isBlank()) {
            details.append(" / ").append(roomName);
        }
        if (!period.isBlank()) {
            details.append(" / ").append(period);
        }

        return details.toString();
    }

    private String formatRentalPeriod(LocalDateTime startAt, LocalDateTime endAt) {
        if (startAt == null || endAt == null) return "";

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String startDate = startAt.toLocalDate().format(dateFormatter);
        String endDate = endAt.toLocalDate().format(dateFormatter);
        String startTime = startAt.toLocalTime().format(timeFormatter);
        String endTime = endAt.toLocalTime().format(timeFormatter);

        if (startDate.equals(endDate)) {
            return startDate + " " + startTime + "~" + endTime;
        }

        return startDate + " " + startTime + " ~ " + endDate + " " + endTime;
    }
}