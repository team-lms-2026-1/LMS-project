package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.enums.CompletionStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;

public record AdminExtraOfferingApplicantBaseRow(
    Long applicationId,
    Long studentAccountId,
    String studentNo,
    String studentName,
    String deptName,
    Integer gradeLevel,
    ExtraApplicationApplyStatus applyStatus,
    CompletionStatus completionStatus
) {}
