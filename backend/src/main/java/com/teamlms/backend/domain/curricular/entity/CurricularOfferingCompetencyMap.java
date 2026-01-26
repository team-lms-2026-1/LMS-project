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
    name = "curricular_offering_competency_map",
    indexes = {
        @Index(name = "idx_cocm_competency_id", columnList = "competency_id")
    }
)
public class CurricularOfferingCompetencyMap extends BaseEntity {

    @EmbeddedId
    private CurricularOfferingCompetencyMapId id;

    @Column(name = "weight", nullable = false)
    private Integer weight; // 1~6

    public Long getOfferingId() {
        return id != null ? id.getOfferingId() : null;
    }

    public Long getCompetencyId() {
        return id != null ? id.getCompetencyId() : null;
    }

    // domain method
    public void changeWeight(Integer weight) {
        this.weight = weight;
    }

}
