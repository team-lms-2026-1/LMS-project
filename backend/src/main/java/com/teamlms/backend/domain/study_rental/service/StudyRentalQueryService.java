package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.domain.study_rental.api.dto.RentalResponse;
import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRentalRepository;
import com.teamlms.backend.domain.study_rental.entity.*;
import com.teamlms.backend.domain.study_rental.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyRentalQueryService {

    private final StudyRoomRentalRepository rentalRepository;
    private final StudyRoomRepository roomRepository;
    private final StudySpaceRepository spaceRepository;
    // private final AccountRepository accountRepository; // 계정 조회용 리포지토리 가정

    public RentalResponse getRentalDetail(Long rentalId) {
        // 1. 예약 정보 조회
        StudyRoomRental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 2. 연관된 룸 조회
        StudyRoom room = roomRepository.findById(rental.getRoomId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 3. 연관된 공간 조회
        StudySpace space = spaceRepository.findById(room.getSpaceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 4. 신청자 조회 (Account 모듈이 있다고 가정)
        // Account applicant = accountRepository.findById(rental.getApplicantAccountId())...;
        String applicantName = "임시 사용자"; // Mock Data

        // 5. DTO 조립 (BFF)
        return RentalResponse.builder()
                .rentalId(rental.getId())
                .roomId(room.getId())
                .roomName(room.getRoomName())   // 외부 테이블 정보 주입
                .spaceId(space.getId())
                .spaceName(space.getSpaceName()) // 외부 테이블 정보 주입
                .applicantId(rental.getApplicantAccountId())
                .applicantName(applicantName)
                .startAt(rental.getStartAt())
                .endAt(rental.getEndAt())
                .status(rental.getStatus())
                .appliedAt(rental.getAppliedAt())
                .rejectionReason(rental.getRejectionReason())
                .build();
    }
}