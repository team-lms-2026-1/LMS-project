package com.teamlms.backend.domain.mbti.api.dto;

import com.teamlms.backend.domain.mbti.dto.MbtiSubmitCommand;

import java.util.List;

public record MbtiSubmitRequest(
        List<MbtiAnswer> answers
) {
    public record MbtiAnswer(
            Long questionId,
            Long choiceId
    ) {
    }

    public MbtiSubmitCommand toCommand(Long accountId) {
        List<Long> choiceIds = answers == null
                ? List.of()
                : answers.stream()
                        .map(MbtiAnswer::choiceId)
                        .toList();
        return new MbtiSubmitCommand(accountId, choiceIds);
    }
}
