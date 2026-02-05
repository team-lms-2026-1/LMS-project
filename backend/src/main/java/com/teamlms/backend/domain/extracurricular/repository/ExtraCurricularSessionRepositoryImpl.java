package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ExtraCurricularSessionRepositoryImpl implements ExtraCurricularSessionRepositoryCustom {

    private final EntityManager em;

    @Override
    public Page<ExtraCurricularSessionListItem> findAdminSessionList(
        Long extraOfferingId,
        String keyword,
        Pageable pageable
    ) {

        String from = """
            from ExtraCurricularSession s
            join ExtraCurricularSessionVideo v on v.sessionId = s.sessionId
            where s.extraOfferingId = :extraOfferingId
        """;

        String where = "";
        if (keyword != null && !keyword.isBlank()) {
            where = " and s.sessionName like :keyword";
        }

        String contentJpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem(
                s.sessionId,
                s.sessionName,
                s.startAt,
                s.endAt,
                s.rewardPoint,
                s.recognizedHours,
                s.status,
                v.videoId,
                v.title,
                v.durationSeconds
            )
        """ + from + where + """
            order by s.startAt asc, s.sessionId asc
        """;

        TypedQuery<ExtraCurricularSessionListItem> contentQuery =
            em.createQuery(contentJpql, ExtraCurricularSessionListItem.class)
              .setParameter("extraOfferingId", extraOfferingId);

        String countJpql = "select count(s.sessionId) " + from + where;
        TypedQuery<Long> countQuery =
            em.createQuery(countJpql, Long.class)
              .setParameter("extraOfferingId", extraOfferingId);

        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.trim() + "%";
            contentQuery.setParameter("keyword", kw);
            countQuery.setParameter("keyword", kw);
        }

        contentQuery
            .setFirstResult((int) pageable.getOffset())
            .setMaxResults(pageable.getPageSize());

        List<ExtraCurricularSessionListItem> rows = contentQuery.getResultList();
        Long total = countQuery.getSingleResult();

        return new PageImpl<>(rows, pageable, total);
    }

    @Override
    public ExtraCurricularSessionDetailResponse findAdminSessionDetail(
        Long extraOfferingId,
        Long sessionId
    ) {
        String jpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionDetailResponse(
                s.sessionId,
                s.extraOfferingId,
                s.sessionName,
                s.startAt,
                s.endAt,
                s.rewardPoint,
                s.recognizedHours,
                s.status,
                v.videoId,
                v.title,
                v.storageKey,
                v.durationSeconds
            )
            from ExtraCurricularSession s
            join ExtraCurricularSessionVideo v on v.sessionId = s.sessionId
            where s.extraOfferingId = :extraOfferingId
              and s.sessionId = :sessionId
        """;

        try {
            return em.createQuery(jpql, ExtraCurricularSessionDetailResponse.class)
                .setParameter("extraOfferingId", extraOfferingId)
                .setParameter("sessionId", sessionId)
                .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
}
