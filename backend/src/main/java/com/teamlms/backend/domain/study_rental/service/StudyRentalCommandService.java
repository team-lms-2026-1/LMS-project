package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.global.security.principal.AuthUser;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.study_rental.api.dto.RentalApplyRequest;
import com.teamlms.backend.domain.study_rental.api.dto.RentalProcessRequest;
import com.teamlms.backend.domain.study_rental.entity.StudyRoom;
import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRentalRepository;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyRentalCommandService {

    private final StudyRoomRentalRepository rentalRepository;
    private final StudyRoomRepository roomRepository;
    private final AccountRepository accountRepository; // 신청자/처리자 조회용

    // 1. 예약 신청
    public void applyRental(Object principal, RentalApplyRequest req) {
        // 1. ID 추출 로직 위임
        Long accountId = extractAccountId(principal);

        Account applicant = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        StudyRoom room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        // 날짜+시간 결합
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
                endAt).isEmpty();

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
    }

    public void processRental(Object principal, Long rentalId, RentalProcessRequest req) {
        // 1. Principal에서 ID 추출 로직을 내부 메서드로 위임
        Long accountId = extractAccountId(principal);

        Account processor = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        StudyRoomRental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        if (req.getStatus() == RentalStatus.APPROVED) {
            boolean isOverlapped = !rentalRepository.findOverlappingRentals(
                    rental.getStudyRoom().getId(),
                    RentalStatus.APPROVED,
                    rental.getStartAt(),
                    rental.getEndAt()).isEmpty();

            if (isOverlapped) {
                throw new BusinessException(ErrorCode.STUDY_RENTAL_NOT_TIME);
            }
        }
        rental.process(req.getStatus(), processor, req.getRejectionReason());
    }

    // 3. 예약 취소 (수정됨: Principal 직접 받음)
    public void cancelRental(Object principal, Long rentalId) {
        // 1. ID 추출 (Controller 로직 이관)
        Long accountId = extractAccountId(principal);

        StudyRoomRental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_NOT_FOUND));

        // 2. 본인 확인
        if (!rental.getApplicant().getAccountId().equals(accountId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        // 3. 상태 확인
        if (rental.getStatus() == RentalStatus.REJECTED || rental.getStatus() == RentalStatus.CANCELED) {
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
}