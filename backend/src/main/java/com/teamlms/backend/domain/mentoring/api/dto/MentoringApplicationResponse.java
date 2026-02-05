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
    private String applyReason;
    
    // Profile info
    private String studentNo; // for student
    private Integer gradeLevel; // for student
    private String deptName;
    private String phone;
    private String email;

    public static MentoringApplicationResponse of(MentoringApplication entity,
            com.teamlms.backend.domain.account.entity.Account account) {
        String loginId = (account != null) ? account.getLoginId() : "Unknown";
        String name = loginId; // Default fallback

        return MentoringApplicationResponse.builder()
                .applicationId(entity.getApplicationId())
                .recruitmentId(entity.getRecruitmentId())
                .accountId(entity.getAccountId())
                .role(entity.getRole())
                .status(entity.getStatus())
                .appliedAt(entity.getAppliedAt())
                .loginId(loginId)
                .name(name)
                .applyReason(entity.getApplyReason())
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
