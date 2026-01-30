package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUserListItem;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CurricularOfferingRepositoryImpl implements CurricularOfferingRepositoryCustom {

    private final EntityManager em;

    // 목록페이지 ( admin )
    @Override
    public Page<CurricularOfferingListItem> findOfferingAdminList(
            Long semesterId,
            String keyword,
            Pageable pageable
    ) {

        String baseJpql = """
            from CurricularOffering o
            join Curricular c on c.curricularId = o.curricularId
            join Semester s on s.semesterId = o.semesterId
            join ProfessorProfile p on p.accountId = o.professorAccountId
        """;

        String where = buildWhere(semesterId, keyword);
        String orderBy = " order by o.createdAt desc";

        // ================= content =================
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

        List<CurricularOfferingListItem> content =
                contentQuery.getResultList();

        // ================= count =================
        String countJpql = """
            select count(o.offeringId)
        """ + baseJpql + where;

        TypedQuery<Long> countQuery =
                em.createQuery(countJpql, Long.class);

        setParams(countQuery, semesterId, keyword);
        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    private String buildWhere(Long semesterId, String keyword) {
        StringBuilder sb = new StringBuilder(" where 1=1 ");

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

    // 목록페이지 ( user )
    @Override
    public Page<CurricularOfferingUserListItem> findOfferingUserList(
            String keyword,
            Pageable pageable
    ) {
        String baseJpql = """
            from CurricularOffering o
            join Curricular c on c.curricularId = o.curricularId
            join Semester s on s.semesterId = o.semesterId
            join ProfessorProfile p on p.accountId = o.professorAccountId

            left join Enrollment e on e.offeringId = o.offeringId
            left join CurricularOfferingCompetencyMap m on m.id.offeringId = o.offeringId
            left join Competency comp on comp.competencyId = m.id.competencyId
        """;

        String where = buildUserWhere(keyword);
        String groupBy = """
            group by
                o.offeringId,
                o.offeringCode,
                c.curricularName,
                o.capacity,
                p.name,
                s.displayName,
                c.credits
        """;
        String orderBy = " order by o.createdAt desc";

        // ================= content =================
        String contentJpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUserListItem(
                o.offeringId,
                o.offeringCode,
                c.curricularName,
                o.capacity,
                p.name,
                s.displayName,
                c.credits,
                count(distinct case
                    when e.enrollmentStatus = com.teamlms.backend.domain.curricular.enums.EnrollmentStatus.ENROLLED
                    then e.enrollmentId
                end),
                max(case when m.weight = 6 then comp.name else null end),
                max(case when m.weight = 5 then comp.name else null end)
            )
        """ + baseJpql + where + groupBy + orderBy;

        TypedQuery<CurricularOfferingUserListItem> contentQuery =
                em.createQuery(contentJpql, CurricularOfferingUserListItem.class);

        setUserParams(contentQuery, keyword);
        contentQuery.setFirstResult((int) pageable.getOffset());
        contentQuery.setMaxResults(pageable.getPageSize());

        List<CurricularOfferingUserListItem> content = contentQuery.getResultList();

        // ================= count =================
        // group by가 있으니 distinct count로!
        String countJpql = """
            select count(distinct o.offeringId)
        """ + baseJpql + where;

        TypedQuery<Long> countQuery = em.createQuery(countJpql, Long.class);
        setUserParams(countQuery, keyword);

        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    private String buildUserWhere(String keyword) {
        StringBuilder sb = new StringBuilder(" where 1=1 ");

        sb.append("and o.status in :visibleStatuses");

        if (keyword != null && !keyword.isBlank()) {
            sb.append("""
                and (
                    lower(o.offeringCode) like :kw
                    or lower(c.curricularName) like :kw
                    or lower(p.name) like :kw
                )
            """);
        }
        return sb.toString();
    }

    private void setUserParams(TypedQuery<?> query, String keyword) {
        query.setParameter(
            "visibleStatuses",
            List.of(
                OfferingStatus.OPEN,
                OfferingStatus.ENROLLMENT_CLOSED,
                OfferingStatus.IN_PROGRESS
            )
        );

        if (keyword != null && !keyword.isBlank()) {
            query.setParameter("kw", "%" + keyword.toLowerCase() + "%");
        }
    }

    // 상세페이지 (기본)
    @Override
    public CurricularOfferingDetailResponse findOfferingDetail(Long offeringId) {

        String jpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse(
                o.offeringId,
                o.offeringCode,

                c.curricularId,
                c.curricularName,
                c.credits,
                c.description,

                c.deptId,
                d.deptName,

                s.semesterId,
                s.displayName,

                p.accountId,
                p.name,
                p.email,
                p.phone,

                o.dayOfWeek,
                o.period,

                o.capacity,
                count(distinct case
                    when e.enrollmentStatus = com.teamlms.backend.domain.curricular.enums.EnrollmentStatus.ENROLLED
                    then e.enrollmentId
                end),

                o.location,
                o.status
            )
            from CurricularOffering o
            join Curricular c on c.curricularId = o.curricularId
            join Dept d on d.deptId = c.deptId
            join Semester s on s.semesterId = o.semesterId
            join ProfessorProfile p on p.accountId = o.professorAccountId
            left join Enrollment e on e.offeringId = o.offeringId
            where o.offeringId = :offeringId
            group by
                o.offeringId, o.offeringCode,
                c.curricularId, c.curricularName, c.credits, c.description,
                c.deptId, d.deptName,
                s.semesterId, s.displayName,
                p.accountId, p.name, p.email, p.phone,
                o.dayOfWeek, o.period,
                o.capacity,
                o.location,
                o.status
        """;


        return em.createQuery(jpql, CurricularOfferingDetailResponse.class)
                .setParameter("offeringId", offeringId)
                .getSingleResult();
    }
}
