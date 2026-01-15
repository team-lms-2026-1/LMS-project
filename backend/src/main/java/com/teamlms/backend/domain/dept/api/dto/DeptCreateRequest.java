package com.teamlms.backend.domain.dept.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class DeptCreateRequest {

    @NotBlank
    @Size(max = 30)
    private String deptCode;

    @NotBlank
    @Size(max = 100)
    private String deptName;

    @NotBlank
    private String description;

    // headProfessorAccountId는 "학과 생성 시 필수 아님"이라 DTO에 아예 안 둠
    // (원하면 나중에 학과장 지정 API로 분리)
}
