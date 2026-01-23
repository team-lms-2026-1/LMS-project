package com.teamlms.backend.domain.study_rental.api.dto;

import com.teamlms.backend.domain.study_rental.enums.RentalStatus; 
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 2. 예약 처리 (승인/반려) - 관리자용
@Getter
@NoArgsConstructor
public class RentalProcessRequest {
    @NotNull
    private RentalStatus status; // APPROVED, REJECTED
    
    private String rejectionReason; // REJECTED일 경우 필수
}