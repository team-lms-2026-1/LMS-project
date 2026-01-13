package com.teamlms.backend.domain.account.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "professor_profile")
public class ProfessorProfile {

    @Id
    @Column(name = "account_id")
    private Long accountId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "professor_no", nullable = false, unique = true)
    private String professorNo;

    @Column(name = "name", nullable = false)
    private String name;

    private String email;
    private String phone;

    /**
     * 학과 ID
     * - 지금 단계에서는 연관관계로 묶지 않는다
     * - Dept 엔티티 안정화 후 @ManyToOne으로 리팩터링 가능
     */
    @Column(name = "dept_id", nullable = false)
    private Long deptId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected ProfessorProfile() {
        // JPA 기본 생성자
    }
}
