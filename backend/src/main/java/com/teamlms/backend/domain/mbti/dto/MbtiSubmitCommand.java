package com.teamlms.backend.domain.mbti.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MbtiSubmitCommand {
    private Long accountId;
    private List<Long> answerChoiceIds;
}
