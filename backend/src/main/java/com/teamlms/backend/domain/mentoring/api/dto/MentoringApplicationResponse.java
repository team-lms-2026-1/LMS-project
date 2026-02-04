package com.teamlms.backend.domain.mentoring.api.dto;

import com.teamlms.backend.domain.mentoring.enums.MentoringRole;
import com.teamlms.backend.domain.mentoring.enums.MentoringApplicationStatus;
import com.teamlms.backend.domain.mentoring.entity.MentoringApplication;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
public class MentoringApplicationResponse {
    private Long applicationId;
    private Long recruitmentId;
    private Long accountId;
    private MentoringRole role;
    private MentoringApplicationStatus status;
    private LocalDateTime appliedAt;

    public static MentoringApplicationResponse from(MentoringApplication entity) {
        return MentoringApplicationResponse.builder()
                .applicationId(entity.getApplicationId())
                .recruitmentId(entity.getRecruitmentId())
                .accountId(entity.getAccountId())
                .role(entity.getRole())
                .status(entity.getStatus())
                .appliedAt(entity.getAppliedAt())
                .build();
    }
}
