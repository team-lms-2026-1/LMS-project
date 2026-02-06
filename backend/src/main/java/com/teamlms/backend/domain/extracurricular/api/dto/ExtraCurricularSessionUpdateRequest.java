package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtraCurricularSessionUpdateRequest {

    // session fields (부분 수정이니까 null 허용)
    private String sessionName;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private Long rewardPoint;
    private Long recognizedHours;

    // video fields (부분 수정)
    private VideoPatch video;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VideoPatch {
        private String title;
        private String videoUrl;
        private String storageKey;
        private Integer durationSeconds;
    }
}
