package com.teamlms.backend.domain.study_rental.dto;

import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import lombok.Builder;
import lombok.Getter;

// 2. 예약 내역 검색 조건
@Getter
@Builder
public class RentalSearchCondition {
    private Long spaceId;       // 특정 공간 필터링
    private Long applicantId;   // 내 예약 조회 시 사용
    private String keyword;     // 통합 검색 (공간명 + 신청자명)
    private RentalStatus status;// 상태 필터링
}