package com.teamlms.backend.domain.extracurricular.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class ExtraCurricularCompetencyMapId implements Serializable {

    @Column(name = "extra_curricular_id")
    private Long extraCurricularId;

    @Column(name = "competency_id")
    private Long competencyId;
}
