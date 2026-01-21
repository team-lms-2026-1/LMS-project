package com.teamlms.backend.domain.log.api.dto;

import java.util.List;

public record UserActivityListResponse(
        List<UserActivityListItem> items,
        UserActivitySummary summary
) {}
