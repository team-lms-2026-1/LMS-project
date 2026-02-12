package com.teamlms.backend.domain.mbti.api.dto;

import com.teamlms.backend.domain.mbti.dto.MbtiSubmitCommand;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class MbtiSubmitRequest {

    @NotNull(message = "답변 목록은 필수입니다.")
    private List<MbtiAnswer> answers;

    @Getter
    @NoArgsConstructor
    public static class MbtiAnswer {
        @NotNull(message = "질문 ID는 필수입니다.")
        private Long questionId;

        @NotNull(message = "선택지 ID는 필수입니다.")
        private Long choiceId;
    }

    public MbtiSubmitCommand toCommand(Long accountId) {
        return MbtiSubmitCommand.builder()
                .accountId(accountId)
                .answerChoiceIds(this.answers.stream()
                        .map(MbtiAnswer::getChoiceId)
                        .collect(java.util.stream.Collectors.toList()))
                .build();
    }
}
