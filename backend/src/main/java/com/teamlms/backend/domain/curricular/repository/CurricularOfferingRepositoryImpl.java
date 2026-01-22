package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CurricularOfferingRepositoryImpl
        implements CurricularOfferingRepositoryCustom {

    private final EntityManager em;

    @Override
    public Page<CurricularOfferingListItem> findOfferingList(
            Long semesterId,
            String keyword,
            Pageable pageable
    ) {

        String baseJpql = """
            from CurricularOffering o,
                 Curricular c,
                 Semester s,
                 ProfessorProfile p
            where c.curricularId = o.curricularId
              and s.semesterId = o.semesterId
              and p.accountId = o.professorAccountId
        """;

        String where = buildWhere(semesterId, keyword);
        String orderBy = " order by o.createdAt desc";

        // ---------- content ----------
        String contentJpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem(
                o.offeringId,
                o.offeringCode,
                c.curricularName,
                o.capacity,
                p.name,
                s.displayName,
                o.location,
                c.credits,
                o.status
            )
        """ + baseJpql + where + orderBy;

        TypedQuery<CurricularOfferingListItem> contentQuery =
                em.createQuery(contentJpql, CurricularOfferingListItem.class);

        setParams(contentQuery, semesterId, keyword);
        contentQuery.setFirstResult((int) pageable.getOffset());
        contentQuery.setMaxResults(pageable.getPageSize());

        List<CurricularOfferingListItem> content = contentQuery.getResultList();

        // ---------- count ----------
        String countJpql = "select count(o.offeringId) " + baseJpql + where;

        TypedQuery<Long> countQuery =
                em.createQuery(countJpql, Long.class);

        setParams(countQuery, semesterId, keyword);
        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    private String buildWhere(Long semesterId, String keyword) {
        StringBuilder sb = new StringBuilder();

        if (semesterId != null) {
            sb.append(" and o.semesterId = :semesterId");
        }
        if (keyword != null && !keyword.isBlank()) {
            sb.append("""
                and (
                    lower(o.offeringCode) like :kw
                    or lower(c.curricularName) like :kw
                )
            """);
        }
        return sb.toString();
    }

    private void setParams(TypedQuery<?> query, Long semesterId, String keyword) {
        if (semesterId != null) {
            query.setParameter("semesterId", semesterId);
        }
        if (keyword != null && !keyword.isBlank()) {
            query.setParameter("kw", "%" + keyword.toLowerCase() + "%");
        }
    }
}
