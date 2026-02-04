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
    private String loginId;
    private String name;

    public static MentoringApplicationResponse of(MentoringApplication entity,
            com.teamlms.backend.domain.account.entity.Account account) {
        String loginId = (account != null) ? account.getLoginId() : "Unknown";
        String name = loginId; // Name field is missing in Account entity, using loginId as placeholder

        return MentoringApplicationResponse.builder()
                .applicationId(entity.getApplicationId())
                .recruitmentId(entity.getRecruitmentId())
                .accountId(entity.getAccountId())
                .role(entity.getRole())
                .status(entity.getStatus())
                .appliedAt(entity.getAppliedAt())
                .loginId(loginId)
                .name(name)
                .build();
    }

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
