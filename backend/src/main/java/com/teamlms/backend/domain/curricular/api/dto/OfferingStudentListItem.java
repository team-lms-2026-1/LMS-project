package com.teamlms.backend.domain.curricular.api.dto;

import com.teamlms.backend.domain.curricular.enums.CompletionStatus;
import com.teamlms.backend.domain.curricular.enums.EnrollmentStatus;

public record OfferingStudentListItem(
        Long enrollmentId,
        Long studentAccountId,

        String studentName,
        String studentNo,
        Integer gradeLevel,
        String deptName,

        Integer rawScore,
        String grade,

        EnrollmentStatus enrollmentStatus,
        CompletionStatus completionStatus
) {}
