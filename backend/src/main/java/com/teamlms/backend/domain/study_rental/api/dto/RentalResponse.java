package com.teamlms.backend.domain.study_rental.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


// 4. 예약 내역 조회 (BFF 구조 - 중첩 객체 활용)
@Getter
@Builder
public class RentalResponse {
    private Long rentalId;

    private SpaceSummary space;
    private RoomSummary room;
    private AccountSummary applicant;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate rentalDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private RentalStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime requestedAt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String rejectionReason;

    // --- Inner Summaries ---
    @Getter @Builder
    public static class SpaceSummary {
        private Long spaceId;
        private String spaceName;
    }

    @Getter @Builder
    public static class RoomSummary {
        private Long roomId;
        private String roomName;
    }

    @Getter @Builder
    public static class AccountSummary {
        private Long accountId;
        private String name;       // 이름
        private String studentNo;  // 학번 (필요 시)
        private String department; // 소속 학과 (필요 시)
    }
}