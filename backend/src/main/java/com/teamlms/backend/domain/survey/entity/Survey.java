package com.teamlms.backend.domain.survey.entity;

import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyTargetGenType;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "survey", indexes = {
        @Index(name = "idx_survey_status", columnList = "status"),
        @Index(name = "idx_survey_dates", columnList = "start_at, end_at")
})
public class Survey extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "survey_id")
    private Long surveyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "survey_type", nullable = false)
    private SurveyType type;

    @Column(length = 100, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SurveyStatus status;

    // 대상자 생성 방식 메타데이터
    @Enumerated(EnumType.STRING)
    @Column(name = "target_gen_type", length = 20, nullable = false)
    private SurveyTargetGenType targetGenType;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    // 상태 변경 비즈니스 메서드
    public void open() {
        this.status = SurveyStatus.OPEN;
    }

    public void close() {
        this.status = SurveyStatus.CLOSED;
    }

    public void patch(String title, String description, LocalDateTime startAt, LocalDateTime endAt, SurveyStatus status, SurveyType type) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (startAt != null) this.startAt = startAt;
        if (endAt != null) this.endAt = endAt;
        if (status != null) this.status = status;
        if (type != null) this.type = type;
    }

    public void update(String title, String description, LocalDateTime startAt, LocalDateTime endAt, SurveyType type) {
        this.title = title;
        this.description = description;
        this.startAt = startAt;
        this.endAt = endAt;
        if (type != null) this.type = type;
    }

    public void increaseViewCount() {
        if (this.viewCount == null) {
            this.viewCount = 0L;
        }
        this.viewCount++;
    }
}