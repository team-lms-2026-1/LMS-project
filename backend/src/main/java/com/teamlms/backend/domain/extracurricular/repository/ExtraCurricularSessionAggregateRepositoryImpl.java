package com.teamlms.backend.domain.extracurricular.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ExtraCurricularSessionAggregateRepositoryImpl implements ExtraCurricularSessionAggregateRepository {

    private final EntityManager em;

    @Override
    public Long sumRewardPointByOfferingId(Long extraOfferingId) {
        String jpql = """
            select coalesce(sum(s.rewardPoint), 0)
            from ExtraCurricularSession s
            where s.extraOfferingId = :extraOfferingId
        """;
        return em.createQuery(jpql, Long.class)
            .setParameter("extraOfferingId", extraOfferingId)
            .getSingleResult();
    }

    @Override
    public Long sumRecognizedHoursByOfferingId(Long extraOfferingId) {
        String jpql = """
            select coalesce(sum(s.recognizedHours), 0)
            from ExtraCurricularSession s
            where s.extraOfferingId = :extraOfferingId
        """;
        return em.createQuery(jpql, Long.class)
            .setParameter("extraOfferingId", extraOfferingId)
            .getSingleResult();
    }
}
