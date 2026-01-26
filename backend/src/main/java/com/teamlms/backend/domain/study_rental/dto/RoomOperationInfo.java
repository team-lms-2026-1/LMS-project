package com.teamlms.backend.domain.study_rental.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

// 3. 룸 운영 상태 계산용 DTO (Service 내부 로직용)
@Getter
@Builder
public class RoomOperationInfo {
    private boolean isActive;
    private LocalDate opStart;
    private LocalDate opEnd;
    private int minPeople;
    private int maxPeople;

    // 오늘 날짜 기준 운영 여부 확인 메서드
    public boolean isOperated(LocalDate date) {
        return isActive && !date.isBefore(opStart) && !date.isAfter(opEnd);
    }
}