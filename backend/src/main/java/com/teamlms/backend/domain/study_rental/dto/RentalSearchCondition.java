package com.teamlms.backend.domain.study_rental.dto;

import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

// 2. 예약 검색/목록 조회 조건
@Getter
@Builder
public class RentalSearchCondition {
    private Long spaceId;
    private Long roomId;
    private Long applicantId;    // "내 예약 보기"
    
    private RentalStatus status; // "승인된 것만 보기"
    
    private LocalDate date;      // "특정 날짜의 예약만 보기"
}