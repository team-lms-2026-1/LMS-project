package com.teamlms.backend.domain.curricular.entity;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class CurricularOfferingCompetencyMapId implements Serializable {

    @Column(name = "offering_id")
    private Long offeringId;

    @Column(name = "competency_id")
    private Long competencyId;
}
