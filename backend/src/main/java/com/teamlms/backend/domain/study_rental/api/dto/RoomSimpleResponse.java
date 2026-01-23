package com.teamlms.backend.domain.study_rental.api.dto;

import lombok.Builder;
import lombok.Getter;

// 2. 룸 요약 응답 (리스트용)
@Getter
@Builder
public class RoomSimpleResponse {
    private Long roomId;
    private String roomName;
    private Integer minPeople;
    private Integer maxPeople;
    private Boolean isActive;
    private String mainImageUrl; // 썸네일
}