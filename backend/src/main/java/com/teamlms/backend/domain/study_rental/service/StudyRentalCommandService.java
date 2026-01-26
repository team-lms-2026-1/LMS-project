package com.teamlms.backend.domain.study_rental.service;

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

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyRentalCommandService {

    private final StudyRoomRentalRepository rentalRepository;
    private final StudyRoomRepository roomRepository;
    private final AccountRepository accountRepository; // 신청자/처리자 조회용

    // 1. 예약 신청
    public void applyRental(Long accountId, RentalApplyRequest req) {
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

        // 중복 예약 확인 (이미 승인된 건과 겹치는지)
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
    }

    // 2. 예약 처리 (승인/반려)
    public void processRental(Long accountId, Long rentalId, RentalProcessRequest req) {
        Account processor = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

        StudyRoomRental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND));

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
    }
}