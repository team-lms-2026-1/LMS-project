package com.teamlms.backend.domain.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record AiAskRequest(
    @NotBlank(message = "질문이 비어있습니다.")
    String question
) {}
