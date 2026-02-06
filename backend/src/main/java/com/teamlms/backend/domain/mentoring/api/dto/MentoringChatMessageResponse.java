package com.teamlms.backend.domain.mentoring.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MentoringChatMessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String content;
    private String type; // "QUESTION" or "ANSWER"
    private LocalDateTime createdAt;
}
