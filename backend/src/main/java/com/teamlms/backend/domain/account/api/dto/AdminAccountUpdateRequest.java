package com.teamlms.backend.domain.account.api.dto;

import com.teamlms.backend.domain.account.enums.*;
import com.teamlms.backend.domain.dept.enums.MajorType;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class AdminAccountUpdateRequest {

    // =========================
    // 공통 (모든 타입)
    // - null이면 "수정 안함"
    // =========================
    private AccountStatus status; // ACTIVE/INACTIVE

    private String name;
    private String email;
    private String phone;

    // =========================
    // STUDENT 전용
    // =========================
    private Integer gradeLevel;
    private AcademicStatus academicStatus;

    @Valid
    private List<MajorMapping> majors;

    // =========================
    // PROFESSOR 전용 (소속)
    // =========================
    private Long deptId;

    // =========================
    // ADMIN 전용
    // =========================
    private String memo;

    // -------------------------
    // 중첩 DTO
    // -------------------------
    @Getter
    @NoArgsConstructor
    public static class MajorMapping {
        private Long majorId;
        private MajorType majorType; // PRIMARY | DOUBLE ...
    }
}
