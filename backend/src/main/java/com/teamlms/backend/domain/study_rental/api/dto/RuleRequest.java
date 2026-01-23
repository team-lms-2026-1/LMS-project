package com.teamlms.backend.domain.study_rental.api.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 3. 규칙 생성 요청
@Getter
@NoArgsConstructor
public class RuleRequest {
    @NotNull
    private Long spaceId;
    
    @NotBlank
    private String content;
    
    private Integer sortOrder = 0;
}