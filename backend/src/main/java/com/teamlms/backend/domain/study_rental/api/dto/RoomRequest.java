package com.teamlms.backend.domain.study_rental.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

// 2. 룸 생성/수정 요청
@Getter
@NoArgsConstructor
public class RoomRequest {
    @NotBlank(message = "{validation.study.room.name.required}")
    private String roomName;

    @Min(1)
    private Integer minPeople;
    
    @NotNull
    private Integer maxPeople;

    private String description;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate operationStartDate;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate operationEndDate;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    private LocalTime availableStartTime;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    private LocalTime availableEndTime;
}
