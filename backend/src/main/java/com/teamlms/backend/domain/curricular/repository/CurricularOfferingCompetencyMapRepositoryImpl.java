package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CurricularOfferingCompetencyMapRepositoryImpl
        implements CurricularOfferingCompetencyMapRepositoryCustom {

    private final EntityManager em;

    @Override
    public List<OfferingCompetencyMappingItem> findOfferingCompetencyMapping(Long offeringId) {

        String jpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem(
                c.competencyId,
                c.code,
                c.name,
                c.description,
                m.weight
            )
            from Competency c
            left join CurricularOfferingCompetencyMap m
                on m.id.competencyId = c.competencyId
               and m.id.offeringId = :offeringId
            order by c.sortOrder asc
        """;

        return em.createQuery(jpql, OfferingCompetencyMappingItem.class)
                .setParameter("offeringId", offeringId)
                .getResultList();
    }
}
