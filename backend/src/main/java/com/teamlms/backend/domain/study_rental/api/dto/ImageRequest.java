package com.teamlms.backend.domain.study_rental.api.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 4. 이미지 등록 요청
@Getter
@NoArgsConstructor
public class ImageRequest {
    @NotNull
    private Long roomId;
    
    @NotBlank
    private String imageUrl;
    
    private Integer sortOrder = 0;
}