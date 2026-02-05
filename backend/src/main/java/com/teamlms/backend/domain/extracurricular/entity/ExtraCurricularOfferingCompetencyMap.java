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
    name = "extra_curricular_offering_competency_map",
    indexes = {
        @Index(name = "idx_ecocm_competency_id", columnList = "competency_id")
    }
)
public class ExtraCurricularOfferingCompetencyMap extends BaseEntity {

    @EmbeddedId
    private ExtraCurricularOfferingCompetencyMapId id;

    @Column(name = "weight", nullable = false)
    private Integer weight; // 0~6 or 1~6 정책대로

    public Long getExtraOfferingId() {
        return id != null ? id.getExtraOfferingId() : null;
    }

    public Long getCompetencyId() {
        return id != null ? id.getCompetencyId() : null;
    }

    public void changeWeight(Integer weight) {
        this.weight = weight;
    }
}
