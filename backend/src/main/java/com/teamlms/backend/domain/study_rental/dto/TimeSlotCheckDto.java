package com.teamlms.backend.domain.study_rental.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

// 1. 예약 중복 체크용 (서비스 핵심 로직)
@Getter
@Builder
public class TimeSlotCheckDto {
    private Long roomId;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Long excludeRentalId; // 수정 시 내 예약은 제외하고 체크
}