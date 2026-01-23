package com.teamlms.backend.domain.study_rental.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

// 1. 공간 상세 응답 (룸 목록 + 규칙 포함)
@Getter
@Builder
public class SpaceDetailResponse {
    private Long spaceId;
    private String spaceName;
    private String location;
    private String description;
    private Boolean isActive;
    
    private List<RoomSimpleResponse> rooms; // 하위 룸 리스트
    private List<RuleResponse> rules;       // 하위 규칙 리스트
}