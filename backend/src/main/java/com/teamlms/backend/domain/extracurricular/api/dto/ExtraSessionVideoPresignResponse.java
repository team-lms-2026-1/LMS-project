package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

public record ExtraSessionVideoPresignResponse(
    String storageKey,
    String uploadUrl,
    LocalDateTime expiresAt
) {}
