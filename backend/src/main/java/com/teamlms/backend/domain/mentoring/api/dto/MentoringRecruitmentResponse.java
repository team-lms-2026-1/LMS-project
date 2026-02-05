package com.teamlms.backend.domain.mentoring.api.dto;

import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
public class MentoringRecruitmentResponse {
    private Long recruitmentId;
    private Long semesterId;
    private String title;
    private String description;
    private LocalDateTime recruitStartAt;
    private LocalDateTime recruitEndAt;
    private MentoringRecruitmentStatus status;
    private LocalDateTime createdAt;

    // 추가: 내 신청 정보 (로그인 시에만 채워짐)
    private String appliedRole;   // "MENTOR" or "MENTEE"
    private com.teamlms.backend.domain.mentoring.enums.MentoringApplicationStatus applyStatus;

    public static MentoringRecruitmentResponse from(MentoringRecruitment entity) {
        return MentoringRecruitmentResponse.builder()
                .recruitmentId(entity.getRecruitmentId())
                .semesterId(entity.getSemesterId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .recruitStartAt(entity.getRecruitStartAt())
                .recruitEndAt(entity.getRecruitEndAt())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
