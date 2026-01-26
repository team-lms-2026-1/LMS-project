package com.teamlms.backend.domain.study_rental.enums;

public enum RentalStatus {
    REQUESTED,  // 승인 요청됨
    APPROVED,   // 승인됨
    REJECTED,   // 반려됨
    CANCELED    // 취소됨
}