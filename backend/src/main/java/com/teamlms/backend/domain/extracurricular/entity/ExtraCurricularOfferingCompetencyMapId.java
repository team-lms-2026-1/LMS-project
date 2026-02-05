package com.teamlms.backend.domain.extracurricular.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class ExtraCurricularOfferingCompetencyMapId implements Serializable {

    @Column(name = "extra_offering_id", nullable = false)
    private Long extraOfferingId;

    @Column(name = "competency_id", nullable = false)
    private Long competencyId;
}
