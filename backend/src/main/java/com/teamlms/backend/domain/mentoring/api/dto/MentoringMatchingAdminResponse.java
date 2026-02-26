package com.teamlms.backend.domain.mentoring.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MentoringMatchingAdminResponse {
    private Long matchingId;
    private Long recruitmentId;
    private String recruitmentTitle;
    
    private Long mentorAccountId;
    private String mentorName;
    
    private Long menteeAccountId;
    private String menteeName;
    
    private String status;
    private LocalDateTime matchedAt;
}
