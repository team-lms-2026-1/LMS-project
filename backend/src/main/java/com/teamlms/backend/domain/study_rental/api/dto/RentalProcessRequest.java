package com.teamlms.backend.domain.study_rental.api.dto;

import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 4. 예약 상태 변경 (관리자 승인/반려)
@Getter
@NoArgsConstructor
public class RentalProcessRequest {
    @NotNull
    private RentalStatus status; // APPROVED, REJECTED

    private String rejectionReason;
}