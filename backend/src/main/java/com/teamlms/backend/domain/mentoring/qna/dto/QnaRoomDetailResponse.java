package com.teamlms.backend.domain.mentoring.qna.dto;

import com.teamlms.backend.domain.mentoring.qna.QnaRoomStatus;

import java.util.List;
import java.util.Map;

public record QnaRoomDetailResponse(
        Long matchingId,
        Long recruitmentId,
        Map<String, Object> mentee,
        Map<String, Object> mentor,
        QnaRoomStatus status,
        List<Map<String, Object>> messages
) {}
