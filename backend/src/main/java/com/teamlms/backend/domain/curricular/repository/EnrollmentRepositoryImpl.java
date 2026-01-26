package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.curricular.api.dto.OfferingStudentListItem;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class EnrollmentRepositoryImpl
        implements EnrollmentRepositoryCustom {

    private final EntityManager em;

    @Override
    public Page<OfferingStudentListItem> findStudentsByOffering(
            Long offeringId,
            String keyword,
            Pageable pageable
    ) {

        String baseJpql = """
            from Enrollment e
            join StudentProfile sp
                on sp.accountId = e.studentAccountId
            join Dept d
                on d.deptId = sp.deptId
            where e.offeringId = :offeringId
        """;

        String where = buildWhere(keyword);
        String orderBy = " order by sp.studentNo asc";

        // ================= content =================
        String contentJpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.OfferingStudentListItem(
                e.enrollmentId,
                e.studentAccountId,
                sp.name,
                sp.studentNo,
                sp.gradeLevel,
                d.deptName,
                e.rawScore,
                e.grade,
                e.enrollmentStatus,
                e.completionStatus
            )
        """ + baseJpql + where + orderBy;

        TypedQuery<OfferingStudentListItem> contentQuery =
                em.createQuery(contentJpql, OfferingStudentListItem.class);

        setParams(contentQuery, offeringId, keyword);
        contentQuery.setFirstResult((int) pageable.getOffset());
        contentQuery.setMaxResults(pageable.getPageSize());

        List<OfferingStudentListItem> content =
                contentQuery.getResultList();

        // ================= count =================
        String countJpql = """
            select count(e.enrollmentId)
        """ + baseJpql + where;

        TypedQuery<Long> countQuery =
                em.createQuery(countJpql, Long.class);

        setParams(countQuery, offeringId, keyword);
        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    // ================= private =================

    private String buildWhere(String keyword) {
        StringBuilder sb = new StringBuilder();

        if (keyword != null && !keyword.isBlank()) {
            sb.append("""
                and (
                    sp.studentNo like :kw
                    or lower(sp.name) like :kw
                )
            """);
        }
        return sb.toString();
    }

    private void setParams(
            TypedQuery<?> query,
            Long offeringId,
            String keyword
    ) {
        query.setParameter("offeringId", offeringId);

        if (keyword != null && !keyword.isBlank()) {
            query.setParameter("kw", "%" + keyword.toLowerCase() + "%");
        }
    }
}
