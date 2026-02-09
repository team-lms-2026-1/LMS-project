package com.teamlms.backend.domain.study_rental.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

// 3. 예약 신청 요청
@Getter
@NoArgsConstructor
public class RentalApplyRequest {
    @NotNull
    private Long roomId;

    @NotNull
    @FutureOrPresent(message = "{validation.study.rental.date.futureOrPresent}")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate rentalDate;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
}


