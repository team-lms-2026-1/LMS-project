package com.teamlms.backend.domain.mentoring.api.dto;

import com.teamlms.backend.domain.mentoring.enums.MentoringApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentoringStatusUpdateRequest {
    @NotNull
    private MentoringApplicationStatus status; // APPROVED, REJECTED

    private String rejectReason; // 반려 시 필수
}
