package com.teamlms.backend.domain.extracurricular.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "extra_curricular_competency_map", indexes = {
        @Index(name = "idx_eccm_competency_id", columnList = "competency_id")
})
public class ExtraCurricularCompetencyMap extends com.teamlms.backend.global.audit.BaseEntity {

    @EmbeddedId
    private ExtraCurricularCompetencyMapId id;

    @Column(name = "weight", nullable = false)
    private Integer weight; // 1~6

    public Long getExtraCurricularId() {
        return id != null ? id.getExtraCurricularId() : null;
    }

    public Long getCompetencyId() {
        return id != null ? id.getCompetencyId() : null;
    }

    // domain method
    public void changeWeight(Integer weight) {
        this.weight = weight;
    }
}
