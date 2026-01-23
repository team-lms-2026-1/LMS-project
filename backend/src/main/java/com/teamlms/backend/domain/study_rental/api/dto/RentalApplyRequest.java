package com.teamlms.backend.domain.study_rental.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
// import com.teamlms.backend.domain.study_rental.enums.RentalStatus; // Enum 필요
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// 1. 예약 신청
@Getter
@NoArgsConstructor
public class RentalApplyRequest {
    @NotNull(message = "룸 ID는 필수입니다.")
    private Long roomId;

    @NotNull
    @FutureOrPresent
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime startAt;

    @NotNull
    @FutureOrPresent
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime endAt;
}