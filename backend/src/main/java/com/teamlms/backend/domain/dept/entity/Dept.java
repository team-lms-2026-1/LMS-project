package com.teamlms.backend.domain.dept.entity;

import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dept")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Dept extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Long deptId;

    @Column(name = "dept_code", nullable = false, unique = true, length = 30)
    private String deptCode;

    @Column(name = "dept_name", nullable = false, unique = true, length = 100)
    private String deptName;

    @Column(name = "description", nullable = false)
    private String description;

    /**
     * 학과장 (공석 허용)
     * - account.account_id (PROFESSOR)
     * - 연관관계로 묶지 않음 (순환/복잡도 방지)
     */
    @Column(name = "head_professor_account_id")
    private Long headProfessorAccountId;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    /* ========= domain method ========= */

    public void updateInfo(
            String deptName,
            Long headProfessorAccountId,
            String description,
            Long actorAccountId
    ) {
        this.deptName = deptName;
        this.headProfessorAccountId = headProfessorAccountId;
        this.description = description;
    }


    public void assignHeadProfessor(Long professorAccountId) {
        this.headProfessorAccountId = professorAccountId;
    }

    public void clearHeadProfessor() {
        this.headProfessorAccountId = null;
    }

    public void deactivate() {
        this.active = false;
    }

    // 활성화 / 비활성화
    public void activate() {
        this.active = true;
    }
}
