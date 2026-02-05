package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ExtraCurricularOfferingRepositoryImpl
        implements ExtraCurricularOfferingRepositoryCustom {

    private final EntityManager em;

    @Override
    public Page<ExtraCurricularOfferingListItem> findAdminList(
        Long semesterId,
        String keyword,
        Pageable pageable
    ) {

        String baseFrom = """
            from ExtraCurricularOffering o
            where 1=1
        """;

        StringBuilder where = new StringBuilder();

        if (semesterId != null) {
            where.append(" and o.semesterId = :semesterId");
        }

        if (keyword != null && !keyword.isBlank()) {
            where.append("""
                and (
                    o.extraOfferingCode like :keyword
                    or o.extraOfferingName like :keyword
                )
            """);
        }

        String contentJpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem(
                o.extraOfferingId,
                o.extraOfferingCode,
                o.extraOfferingName,
                o.hostContactName,
                o.rewardPointDefault,
                o.recognizedHoursDefault,
                o.status
            )
        """ + baseFrom + where + " order by o.extraOfferingCode asc";

        TypedQuery<ExtraCurricularOfferingListItem> contentQuery =
            em.createQuery(contentJpql, ExtraCurricularOfferingListItem.class);

        String countJpql = "select count(o.extraOfferingId) " + baseFrom + where;
        TypedQuery<Long> countQuery = em.createQuery(countJpql, Long.class);

        // 파라미터 바인딩
        if (semesterId != null) {
            contentQuery.setParameter("semesterId", semesterId);
            countQuery.setParameter("semesterId", semesterId);
        }

        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.trim() + "%";
            contentQuery.setParameter("keyword", kw);
            countQuery.setParameter("keyword", kw);
        }

        contentQuery
            .setFirstResult((int) pageable.getOffset())
            .setMaxResults(pageable.getPageSize());

        return new PageImpl<>(
            contentQuery.getResultList(),
            pageable,
            countQuery.getSingleResult()
        );
    }


    @Override
    public ExtraCurricularOfferingBasicDetailResponse findBasicDetailById(Long extraOfferingId) {

        String jpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse(
                o.extraOfferingId,
                o.extraCurricularId,

                ec.extraCurricularCode,
                ec.extraCurricularName,
                ec.hostOrgName,
                ec.description,

                o.extraOfferingCode,
                o.extraOfferingName,

                count(distinct case
                    when a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
                    then a.applicationId
                end),

                o.hostContactName,
                o.hostContactPhone,
                o.hostContactEmail,

                o.rewardPointDefault,
                o.recognizedHoursDefault,

                o.semesterId,
                s.displayName,

                o.operationStartAt,
                o.operationEndAt,

                o.status
            )
            from ExtraCurricularOffering o
            join ExtraCurricular ec
                on ec.extraCurricularId = o.extraCurricularId
            join Semester s
                on s.semesterId = o.semesterId
            left join ExtraCurricularApplication a
                on a.extraOfferingId = o.extraOfferingId
            where o.extraOfferingId = :extraOfferingId
            group by
                o.extraOfferingId,
                o.extraCurricularId,

                ec.extraCurricularCode,
                ec.extraCurricularName,
                ec.hostOrgName,
                ec.description,

                o.extraOfferingCode,
                o.extraOfferingName,

                o.hostContactName,
                o.hostContactPhone,
                o.hostContactEmail,

                o.rewardPointDefault,
                o.recognizedHoursDefault,

                o.semesterId,
                s.displayName,

                o.operationStartAt,
                o.operationEndAt,

                o.status
        """;

        return em.createQuery(jpql, ExtraCurricularOfferingBasicDetailResponse.class)
            .setParameter("extraOfferingId", extraOfferingId)
            .getSingleResult();
    }

}
