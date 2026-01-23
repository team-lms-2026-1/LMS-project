package com.teamlms.backend.domain.curricular.entity;

import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(
    name = "curricular",
    indexes = {
        @Index(name = "idx_curricular_dept_id", columnList = "dept_id"),
        @Index(name = "idx_curricular_is_active", columnList = "is_active")
    }
)
public class Curricular extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "curricular_id")
    private Long curricularId;

    @Column(name = "curricular_code", length = 50, nullable = false)
    private String curricularCode;

    @Column(name = "curricular_name", length = 200, nullable = false)
    private String curricularName;

    @Column(name = "dept_id", nullable = false)
    private Long deptId;

    @Column(name = "credits", nullable = false)
    private Integer credits; // 이수학점( 1,2,3,4,5 등 )

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    /* ========= domain method ========= */

    public void patch(String curricularName, Long deptId, Integer credits, String description, Boolean isActive) {
        if (curricularName != null) this.curricularName = curricularName;
        if (deptId != null) this.deptId = deptId;
        if (credits != null) this.credits = credits;
        if (description != null) this.description = description;
        if (isActive != null) this.isActive = isActive;
    }
}
