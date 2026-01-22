package com.teamlms.backend.domain.mentoring.batch.dto;

import java.util.List;

public record BatchCommitRequest(List<BatchAssignmentItem> assignments) {}
