package com.teamlms.backend.domain.extracurricular.entity;

import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "extra_curricular_session_video",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_extra_video_session_id", columnNames = {"session_id"}),
        @UniqueConstraint(name = "uq_extra_video_storage_key", columnNames = {"storage_key"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtraCurricularSessionVideo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "video_id", nullable = false)
    private Long videoId;

    // DDL: session_id BIGINT NOT NULL UNIQUE  (1:1)
    @Column(name = "session_id", nullable = false, unique = true)
    private Long sessionId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "video_url", length = 1000)
    private String videoUrl;

    @Column(name = "storage_key", length = 500, unique = true)
    private String storageKey;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;
}
