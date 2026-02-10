package com.teamlms.backend.domain.account.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

import com.teamlms.backend.domain.account.enums.AcademicStatus;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.dept.enums.MajorType;

@Getter
@NoArgsConstructor
public class AdminAccountCreateRequest {

    @NotBlank
    @Size(min = 9, max = 9)
    private String loginId;

    @NotBlank
    @Size(min = 6)
    // 영문+숫자+특수문자 포함(간단버전)
    @Pattern(
    regexp = "^(?=.*[A-Za-z])(?=.*\\d)\\S{6,}$",
    message = "{validation.account.password.pattern}"
    )
    private String password;


    @NotNull
    private AccountType accountType; // STUDENT | PROFESSOR | ADMIN

    @NotNull
    private AccountStatus status;      // ACTIVE | INACTIVE

    @Valid
    @NotNull
    private Profile profile;

    @Getter
    @NoArgsConstructor
    public static class Profile {

        // STUDENT
        private String studentNo;
        private Integer gradeLevel;
        private AcademicStatus academicStatus;

        @Valid
        private List<MajorMapping> majors;

        // PROFESSOR
        private String professorNo;

        // ADMIN
        private String adminNo;
        private String memo;

        // COMMON
        @NotBlank
        private String name;
        private String email;
        private String phone;
        
        // STUDENT, PROFESSOR 공통
        private Long deptId;
    }

    @Getter
    @NoArgsConstructor
    public static class MajorMapping {

        @NotNull
        private Long majorId;

        @NotNull
        private MajorType majorType; // PRIMARY | DOUBLE ...
    }
}
