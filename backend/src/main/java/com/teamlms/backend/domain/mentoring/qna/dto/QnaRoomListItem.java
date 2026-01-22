package com.teamlms.backend.domain.mentoring.qna.dto;

import com.teamlms.backend.domain.mentoring.qna.QnaRoomStatus;

import java.time.LocalDateTime;
import java.util.Map;

public record QnaRoomListItem(
        Long matchingId,
        Map<String, Object> mentee,
        Map<String, Object> mentor,
        long answerCount,
        QnaRoomStatus status,
        LocalDateTime lastMessageAt
) {}
