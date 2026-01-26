package com.teamlms.backend.domain.extracurricular.entity;

import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(
    name = "extra_curricular",
    indexes = {
        @Index(name = "idx_extra_curricular_is_active", columnList = "is_active")
    }
)
public class ExtraCurricular extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "extra_curricular_id")
    private Long extraCurricularId;

    @Column(name = "extra_curricular_code", length = 50)
    private String extraCurricularCode;

    @Column(name = "extra_curricular_name", length = 200, nullable = false)
    private String extraCurricularName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "host_org_name", length = 200)
    private String hostOrgName;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    /* ========= domain method ========= */

    public void patch(String extraCurricularName, String description, String hostOrgName, Boolean isActive) {
        if (extraCurricularName != null) this.extraCurricularName = extraCurricularName;
        if (description != null) this.description = description;
         if (hostOrgName != null) this.hostOrgName = hostOrgName;
        if (isActive != null) this.isActive = isActive;
    }
}
