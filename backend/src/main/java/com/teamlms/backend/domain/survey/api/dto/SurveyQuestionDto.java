package com.teamlms.backend.domain.survey.api.dto;

import com.teamlms.backend.domain.survey.enums.SurveyQuestionType;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record SurveyQuestionDto(
    @NotBlank
    String questionText,
    
    Integer sortOrder,
    
    Integer minVal,
    
    Integer maxVal,
    
    String minLabel,
    
    String maxLabel,

    Boolean isRequired,

    SurveyQuestionType questionType,
    
    List<String> options
) {
    public SurveyQuestionDto {
        if (minVal == null) minVal = 1;
        if (maxVal == null) maxVal = 5;
        if (isRequired == null) isRequired = true;
    }
}
