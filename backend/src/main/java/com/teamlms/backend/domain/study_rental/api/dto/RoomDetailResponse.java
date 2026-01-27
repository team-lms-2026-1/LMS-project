package com.teamlms.backend.domain.study_rental.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

// 3. 룸 상세 정보 (모달창용)
@Getter
@Builder
public class RoomDetailResponse {
    private Long roomId;
    private String roomName;
    private Integer minPeople;
    private Integer maxPeople;
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate operationStartDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate operationEndDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime availableStartTime;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime availableEndTime;
}