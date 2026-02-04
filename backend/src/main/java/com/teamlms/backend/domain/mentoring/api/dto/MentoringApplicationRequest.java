package com.teamlms.backend.domain.mentoring.api.dto;

import com.teamlms.backend.domain.mentoring.enums.MentoringRole;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentoringApplicationRequest {
    @NotNull
    private Long recruitmentId;

    @NotNull
    private MentoringRole role;
}
