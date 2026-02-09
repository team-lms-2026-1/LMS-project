package com.teamlms.backend.domain.extracurricular.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ExtraSessionVideoPresignRequest(

    @NotBlank
    @Size(max = 255)
    String originalFileName,

    @NotBlank
    @Size(max = 100)
    String contentType,

    // 옵션: 프론트가 보내주면 1차 검증/로그용으로만 사용 (presigned PUT에서 완전 강제는 어려움)
    @NotNull
    @Positive
    Long contentLength
) {}
