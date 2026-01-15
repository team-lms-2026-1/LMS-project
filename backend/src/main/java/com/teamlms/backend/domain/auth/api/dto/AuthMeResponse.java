package com.teamlms.backend.domain.auth.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthMeResponse {
    private Long accountId;
    private String loginId;
    private String accountType;

    private Profile profile; // 타입별 최소 정보

    @Getter
    @Builder
    public static class Profile {
        private String name;
        private String email;
        private String phone;

        // STUDENT
        private String studentNo;
        private Integer gradeLevel;
        private String academicStatus;

        // PROFESSOR
        private String professorNo;
        private Long deptId;
    }
}
