package com.teamlms.backend.domain.study_rental.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "study_space", indexes = @Index(name = "idx_study_space_active", columnList = "is_active"))
public class StudySpace extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "space_id")
    private Long id;

    @Column(name = "space_name", nullable = false)
    private String spaceName;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public void update(String spaceName, String location, String description) {
        this.spaceName = spaceName;
        this.location = location;
        this.description = description;
    }
}