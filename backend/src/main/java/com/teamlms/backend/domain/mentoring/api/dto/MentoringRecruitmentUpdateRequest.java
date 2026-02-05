package com.teamlms.backend.domain.mentoring.api.dto;

import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class MentoringRecruitmentUpdateRequest {

    @NotNull
    private Long semesterId;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDateTime recruitStartAt;

    @NotNull
    private LocalDateTime recruitEndAt;

    @NotNull
    private MentoringRecruitmentStatus status;
}
