package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingItem;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ExtraCurricularOfferingCompetencyMapRepositoryImpl
        implements ExtraCurricularOfferingCompetencyMapRepositoryCustom {

    private final EntityManager em;

    @Override
    public List<ExtraOfferingCompetencyMappingItem> findOfferingCompetencyMapping(Long extraOfferingId) {

        String jpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingItem(
                c.competencyId,
                c.code,
                c.name,
                c.description,
                m.weight
            )
            from Competency c
            left join ExtraCurricularOfferingCompetencyMap m
                on m.id.competencyId = c.competencyId
            and m.id.extraOfferingId = :extraOfferingId
            order by c.sortOrder asc
        """;

        return em.createQuery(jpql, ExtraOfferingCompetencyMappingItem.class)
                .setParameter("extraOfferingId", extraOfferingId)
                .getResultList();
    }
}
