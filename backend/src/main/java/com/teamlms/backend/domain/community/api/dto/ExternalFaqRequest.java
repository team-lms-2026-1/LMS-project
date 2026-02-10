package com.teamlms.backend.domain.community.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter 
@NoArgsConstructor
public class ExternalFaqRequest {
    @NotNull(message = "{validation.community.externalFaq.category.required}")
    private Long categoryId;

    @NotBlank(message = "{validation.community.externalFaq.title.required}")
    private String title;

    @NotBlank(message = "{validation.community.externalFaq.content.required}")
    private String content;
}