package com.teamlms.backend.domain.survey.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "survey_type_config")
public class SurveyTypeConfig extends BaseEntity {

    @Id
    @Column(name = "type_code", length = 50)
    private String typeCode;

    @Column(name = "type_name", length = 100, nullable = false)
    private String typeName;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
