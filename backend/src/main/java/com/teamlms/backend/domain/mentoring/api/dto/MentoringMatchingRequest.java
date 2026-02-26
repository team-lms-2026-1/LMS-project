package com.teamlms.backend.domain.mentoring.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentoringMatchingRequest {
    @NotNull
    private Long recruitmentId;

    @NotNull
    private Long mentorApplicationId;

    @NotNull
    private java.util.List<Long> menteeApplicationIds;
}
