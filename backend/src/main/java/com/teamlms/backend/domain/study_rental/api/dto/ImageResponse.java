package com.teamlms.backend.domain.study_rental.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImageResponse {
    private Long imageId;
    private String imageUrl;
    private Integer sortOrder;
}