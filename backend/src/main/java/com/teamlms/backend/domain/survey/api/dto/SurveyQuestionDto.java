package com.teamlms.backend.domain.survey.api.dto;

import com.teamlms.backend.domain.survey.enums.SurveyQuestionType;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class SurveyQuestionDto {
    @NotBlank(message = "질문 내용을 입력해주세요")
    private String questionText;
    private Integer sortOrder;
    private Integer minVal = 1;
    private Integer maxVal = 5;
    private String minLabel;
    private String maxLabel;

    private Boolean isRequired = true;

    private SurveyQuestionType questionType;
    private List<String> options;
}
