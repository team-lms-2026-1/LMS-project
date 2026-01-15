package com.teamlms.backend.domain.dept.entity;

import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "major",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_major_dept_name",
            columnNames = {"dept_id", "major_name"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Major extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "major_id")
    private Long majorId;

    @Column(name = "dept_id", nullable = false)
    private Long deptId;

    @Column(name = "major_code", nullable = false, unique = true, length = 30)
    private String majorCode;

    @Column(name = "major_name", nullable = false, length = 100)
    private String majorName;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /* ========= domain method ========= */

    public void updateInfo(String majorName, String description, int sortOrder) {
        this.majorName = majorName;
        this.description = description;
        this.sortOrder = sortOrder;
    }

    public void deactivate() {
        this.active = false;
    }
}
