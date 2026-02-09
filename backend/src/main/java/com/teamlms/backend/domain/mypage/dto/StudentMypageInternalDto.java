package com.teamlms.backend.domain.mypage.dto;

import com.teamlms.backend.domain.account.enums.AcademicStatus;
// import com.teamlms.backend.domain.mypage.dto.TimetableInfo;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

/**
 * Internal DTO for Student MyPage Summary.
 * Decouples the Service layer from the Entity/View implementation.
 */
@Builder
public record StudentMypageInternalDto(
        Long accountId,
        String studentNo,
        String studentName,
        String deptName,
        Integer gradeLevel,
        AcademicStatus academicStatus,
        String profileImageUrl,
        Long totalCredits,
        BigDecimal averageScore,
        Long totalExtraPoints,
        Long totalExtraHours,
        List<TimetableInfo> currentTimetableJson) {
}
