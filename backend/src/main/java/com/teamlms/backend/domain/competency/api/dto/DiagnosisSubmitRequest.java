package com.teamlms.backend.domain.competency.api.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class DiagnosisSubmitRequest {
    private List<AnswerSubmitItem> answers;

    @Getter
    @Setter
    public static class AnswerSubmitItem {
        private Long questionId;
        private Integer scaleValue;
        private String shortText;
    }
}
