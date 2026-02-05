package com.teamlms.backend.domain.mentoring.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MentoringMatchingResponse {
    private Long matchingId;
    private Long recruitmentId;
    private String recruitmentTitle;
    private Long partnerId;
    private String partnerName;
    private String role; // MY role: "MENTOR" or "MENTEE"
    private String status;
    private LocalDateTime matchedAt;
}
