package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantBaseRow;
import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantSessionRow;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem;

import jakarta.persistence.EntityManager;
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
        """ + baseFrom + where + " order by o.createdAt desc, o.extraOfferingId desc";

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

    @Override
    public Page<AdminExtraOfferingApplicantBaseRow> findApplicantPage(
        Long extraOfferingId,
        String keyword,
        Pageable pageable
    ) {

        String baseFrom = """
            from ExtraCurricularApplication a
            join StudentProfile sp
                on sp.accountId = a.studentAccountId
            join Dept d
                on d.deptId = sp.deptId
            where a.extraOfferingId = :extraOfferingId
        """;

        String where = "";
        if (keyword != null && !keyword.isBlank()) {
            where = """
                and (
                    sp.studentNo like :kw
                    or lower(sp.name) like :kw
                    or lower(d.deptName) like :kw
                )
            """;
        }

        String contentJpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantBaseRow(
                a.applicationId,
                a.studentAccountId,
                sp.studentNo,
                sp.name,
                d.deptName,
                sp.gradeLevel,
                a.applyStatus,
                a.completionStatus
            )
        """ + baseFrom + where + " order by a.applicationId asc";

        TypedQuery<AdminExtraOfferingApplicantBaseRow> contentQuery =
            em.createQuery(contentJpql, AdminExtraOfferingApplicantBaseRow.class)
              .setParameter("extraOfferingId", extraOfferingId);

        String countJpql = "select count(a.applicationId) " + baseFrom + where;
        TypedQuery<Long> countQuery =
            em.createQuery(countJpql, Long.class)
              .setParameter("extraOfferingId", extraOfferingId);

        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.trim().toLowerCase() + "%";
            contentQuery.setParameter("kw", kw);
            countQuery.setParameter("kw", kw);
        }

        contentQuery
            .setFirstResult((int) pageable.getOffset())
            .setMaxResults(pageable.getPageSize());

        List<AdminExtraOfferingApplicantBaseRow> rows = contentQuery.getResultList();
        Long total = countQuery.getSingleResult();

        return new PageImpl<>(rows, pageable, total);
    }

    @Override
    public List<AdminExtraOfferingApplicantSessionRow> findApplicantSessionAttendance(
        Long extraOfferingId,
        List<Long> applicationIds
    ) {
        if (applicationIds == null || applicationIds.isEmpty()) {
            return List.of();
        }

        String jpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantSessionRow(
                a.applicationId,
                s.sessionId,
                s.sessionName,
                s.status,
                coalesce(c.isAttended, false)
            )
            from ExtraCurricularApplication a
            join ExtraCurricularSession s
                on s.extraOfferingId = a.extraOfferingId
            left join ExtraCurricularSessionCompletion c
                on c.sessionId = s.sessionId
                and c.applicationId = a.applicationId
            where a.extraOfferingId = :extraOfferingId
              and a.applicationId in :applicationIds
            order by a.applicationId asc, s.startAt asc, s.sessionId asc
        """;

        return em.createQuery(jpql, AdminExtraOfferingApplicantSessionRow.class)
            .setParameter("extraOfferingId", extraOfferingId)
            .setParameter("applicationIds", applicationIds)
            .getResultList();
    }

}
