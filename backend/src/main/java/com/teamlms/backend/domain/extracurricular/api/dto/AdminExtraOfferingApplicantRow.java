package com.teamlms.backend.domain.extracurricular.api.dto;

import java.util.List;

import com.teamlms.backend.domain.extracurricular.enums.CompletionStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;

public record AdminExtraOfferingApplicantRow(
    Long applicationId,
    Long studentAccountId,

    String studentNo,
    String studentName,
    String deptName,
    String gradeLevel,

    ExtraApplicationApplyStatus applyStatus,
    CompletionStatus completionStatus,

    List<SessionAttendance> sessions
) {
    public record SessionAttendance(
        Long sessionId,
        String sessionTitle,
        ExtraSessionStatus sessionStatus,
        Boolean isAttended
    ) {}
}
