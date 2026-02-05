package com.teamlms.backend.domain.mentoring.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentoringQuestionRequest {
    @NotNull
    private Long matchingId;

    @NotBlank
    private String content;
}
