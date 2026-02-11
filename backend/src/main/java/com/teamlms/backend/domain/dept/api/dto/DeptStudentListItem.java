package com.teamlms.backend.domain.dept.api.dto;

import com.teamlms.backend.domain.account.enums.AcademicStatus;

public record DeptStudentListItem(
    Long accountId,
    String studentNo,
    String name,
    Integer gradeLevel,
    AcademicStatus academicStatus,
    String majorName, // 주전공
    String email
) {
}