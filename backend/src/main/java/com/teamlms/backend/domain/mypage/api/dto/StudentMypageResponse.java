package com.teamlms.backend.domain.mypage.api.dto;

import com.teamlms.backend.domain.account.enums.AcademicStatus;
import com.teamlms.backend.domain.mypage.dto.TimetableInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
@Schema(description = "Response DTO for Student MyPage Summary")
public record StudentMypageResponse(
        @Schema(description = "Account ID") Long accountId,

        @Schema(description = "Student Number (ID)") String studentNo,

        @Schema(description = "Student Name") String studentName,

        @Schema(description = "Department Name") String deptName,

        @Schema(description = "Current Grade Level") Integer gradeLevel,

        @Schema(description = "Academic Status (ENROLLED, LEAVE, etc.)") AcademicStatus academicStatus,

        @Schema(description = "Profile Image URL") String profileImageUrl,

        @Schema(description = "Total Earned Credits (Passed Courses)") Long totalCredits,

        @Schema(description = "Average Score (GPA proxy)") BigDecimal averageScore,

        @Schema(description = "Total Extra-Curricular Points Earned") Long totalExtraPoints,

        @Schema(description = "Total Extra-Curricular Hours Completed") Long totalExtraHours,

        @Schema(description = "Current Semester Timetable (JSON List)") List<TimetableInfo> currentTimetable) {
}
