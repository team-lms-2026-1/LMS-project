package com.teamlms.backend.domain.mbti.dto;

import java.util.List;

public record MbtiSubmitCommand(
        Long accountId,
        List<Long> answerChoiceIds
) {
}
