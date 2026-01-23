package com.teamlms.backend.domain.survey.entity;

import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import com.teamlms.backend.global.entity.BaseEntity; // BaseEntity 경로 확인 필요
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
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "survey_type", nullable = false)
    private SurveyType type;

    @Column(nullable = false)
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

    // 대상자 생성 방식 메타데이터 (ALL, DEPT, USER 등)
    @Column(name = "target_gen_type", nullable = false)
    private String targetGenType;

    // 상태 변경 비즈니스 메서드
    public void open() {
        this.status = SurveyStatus.OPEN;
    }

    public void close() {
        this.status = SurveyStatus.CLOSED;
    }
}