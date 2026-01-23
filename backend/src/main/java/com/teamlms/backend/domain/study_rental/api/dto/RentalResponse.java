package com.teamlms.backend.domain.study_rental.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

// 예약 정보 상세 (BFF 스타일)
@Getter
@Builder
public class RentalResponse {
    private Long rentalId;
    
    // ★ 룸 정보 포함
    private Long roomId;
    private String roomName; 
    
    // ★ 공간 정보 포함
    private Long spaceId;
    private String spaceName; 
    
    // ★ 신청자 정보 포함
    private Long applicantId;
    private String applicantName; 
    private String applicantStudentId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime startAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime endAt;
    
    private RentalStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime appliedAt;
    
    private String rejectionReason;
}