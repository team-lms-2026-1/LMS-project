package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SurveyParticipantResponse {
    private Long targetId;
    private Long accountId;
    private String loginId;          // 학번/사번
    private SurveyTargetStatus status; // PENDING(미참여), SUBMITTED(제출)
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime submittedAt; // 제출 시간
}