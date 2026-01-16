package com.teamlms.backend.domain.account.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

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
    message = "비밀번호는 6자 이상이며 영문+숫자를 포함하고 공백은 허용되지 않습니다."
    )
    private String password;


    @NotNull
    private String accountType; // STUDENT | PROFESSOR | ADMIN

    @NotNull
    private String status;      // ACTIVE | INACTIVE

    @Valid
    @NotNull
    private Profile profile;

    @Getter
    @NoArgsConstructor
    public static class Profile {

        // STUDENT
        private String studentNo;
        private Integer gradeLevel;
        private String academicStatus;
        private List<MajorMapping> majors;

        // PROFESSOR
        private String professorNo;
        private Long deptId;

        // ADMIN
        private String adminNo; // (요청에 있으면 검증만)
        private String memo;

        // COMMON
        @NotBlank
        private String name;
        private String email;
        private String phone;
    }

    @Getter
    @NoArgsConstructor
    public static class MajorMapping {
        private Long majorId;
        private String majorType; // PRIMARY | DOUBLE ...
    }
}
