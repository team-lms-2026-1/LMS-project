package com.teamlms.backend.domain.study_rental.api.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 1. 공간 생성/수정 요청
@Getter
@NoArgsConstructor
public class SpaceRequest {
    @NotBlank(message = "공간 이름은 필수입니다.")
    private String spaceName;

    @NotBlank(message = "위치는 필수입니다.")
    private String location;

    private String description;
    
    private Boolean isActive = true;
}