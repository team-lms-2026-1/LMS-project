package com.teamlms.backend.domain.study_rental.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

// 3. 룸 상세 응답 (단건 조회)
@Getter
@Builder
public class RoomDetailResponse {
    private Long roomId;
    private Long spaceId;
    private String spaceName; // ★ ID-only 보완: 화면 표시용 이름
    
    private String roomName;
    private Integer minPeople;
    private Integer maxPeople;
    private String description;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate operationStartDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate operationEndDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime rentableStartTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime rentableEndTime;
    
    private Boolean isActive;
    private List<ImageResponse> images;
}