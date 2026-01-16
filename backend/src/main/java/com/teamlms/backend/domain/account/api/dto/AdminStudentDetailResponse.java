package com.teamlms.backend.domain.account.api.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.teamlms.backend.domain.account.enums.AcademicStatus;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.dept.enums.MajorType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStudentDetailResponse {
    
    private Long accountId;
    private String loginId;
    private AccountType accountType; // student
    private AccountStatus status;
    private LocalDateTime createdAt;
    
    private Profile profile;

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Profile {
        private String name;
        private String email;
        private String phone;
        
        private Integer gradeLevel;
        private AcademicStatus academicStatus;

        private DeptSimple dept;
        private MajorSimple primaryMajor;

        @Builder.Default
        private List<MajorItem> majors = List.of();
    }

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DeptSimple {
        private Long deptId;
        private String deptName;
    }

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MajorSimple {
        private Long majorId;
        private String majorName;
    }

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MajorItem {
        private Long majorId;
        private String majorName;
        private DeptSimple dept;
        private MajorType majorType;
    }
}
