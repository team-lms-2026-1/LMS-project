package com.teamlms.backend.domain.mentoring.api.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentoringRecruitmentCreateRequest {
    @NotNull
    private Long semesterId;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDateTime recruitStartAt;

    @NotNull
    private LocalDateTime recruitEndAt;
}
