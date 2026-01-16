package com.teamlms.backend.domain.community.api.dto;

// BFF가 색상 코드나 이름을 보낼 때 유효성 검사를 수행하는 dto
// 카테고리
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class ExternalCategoryRequest {
    @NotBlank
    private String name;
    @NotBlank @Pattern(regexp = "^#([A-Fa-f0-9]{6})$")
    private String bgColorHex;
    @NotBlank @Pattern(regexp = "^#([A-Fa-f0-9]{6})$")
    private String textColorHex;
}