package com.teamlms.backend.domain.log.api.dto;

public record UserActivitySummary(
        long totalAccounts,
        long onlineAccounts
) {}
