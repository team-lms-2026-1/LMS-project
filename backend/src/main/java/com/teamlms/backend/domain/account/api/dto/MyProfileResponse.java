package com.teamlms.backend.domain.account.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyProfileResponse {
    private Long accountId;
    private String name;
    private String email;
    private String phone;
    
    // Student fields
    private String studentNo;
    private Integer gradeLevel;
    private String deptName;
    private String majorName;
}
