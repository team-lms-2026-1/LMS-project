package com.teamlms.backend.domain.competency.entitiy;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(
    name = "competency",
    indexes = {
        @Index(name = "idx_competency_sort_order", columnList = "sort_order")
    }
)
public class Competency extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "competency_id")
    private Long competencyId;

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code; // C1~C6

    @Column(name = "name", nullable = false, length = 100)
    private String name; // English

    @Column(name = "description", length = 1000)
    private String description; // Korean

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
