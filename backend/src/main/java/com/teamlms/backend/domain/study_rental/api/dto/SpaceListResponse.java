package com.teamlms.backend.domain.study_rental.api.dto;

import lombok.Builder;
import lombok.Getter;

// 1. 학습공간 목록 조회용 (Card 형태 표시에 최적화)
@Getter
@Builder
public class SpaceListResponse {
    private Long spaceId;
    private String spaceName;
    private String location;
    private Boolean isActive;
    
    // 대표 이미지 (이미지 리스트 중 첫 번째 or 썸네일)
    private String mainImageUrl; 

    private Boolean isRentable;  // 오늘 예약 가능 여부
    private Integer minPeople;   // 최소 수용 인원
    private Integer maxPeople;   // 최대 수용 인원
}