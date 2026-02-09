package com.teamlms.backend.domain.community.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class ExternalResourceRequest {

    @NotNull(message = "{validation.community.externalResource.categoryId.required}")
    private Long categoryId;

    @NotBlank(message = "{validation.community.externalResource.title.required}")
    private String title;

    @NotBlank(message = "{validation.community.externalResource.content.required}")
    private String content;
}