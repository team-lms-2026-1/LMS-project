package com.teamlms.backend.domain.competency.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

/**
 * 내부 DTO: 진단지 수정을 위한 완전한 데이터
 */
@Getter
@Builder
public class DiagnosisUpdateCommand {
    private Long diagnosisId;
    private String title;
    private String status;
    private java.time.LocalDateTime endedAt;
    private List<DiagnosisQuestionUpdate> questionUpdates;
}
