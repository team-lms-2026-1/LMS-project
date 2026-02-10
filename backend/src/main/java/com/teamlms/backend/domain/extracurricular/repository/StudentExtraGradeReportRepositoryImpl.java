package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularGradeListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCompletionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraGradeDetailHeaderResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraGradeTrendItem;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class StudentExtraGradeReportRepositoryImpl implements StudentExtraGradeReportRepositoryCustom {

    private final EntityManager em;

    @Override
    public StudentExtraGradeDetailHeaderResponse getDetailHeader(Long studentAccountId) {
        String totalPointsExpr = """
            coalesce(
              sum(case
                    when a.completionStatus = com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.PASSED
                    then o.rewardPointDefault else 0 end
              ),
              0L
            )
        """;

        String totalHoursExpr = """
            coalesce(
              sum(case
                    when a.completionStatus = com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.PASSED
                    then o.recognizedHoursDefault else 0 end
              ),
              0L
            )
        """;

        String headerJpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraGradeDetailHeaderResponse(
              sp.accountId,
              sp.name,
              sp.studentNo,
              d.deptId,
              d.deptName,
              sp.gradeLevel,
              %s,
              %s,
              null
            )
            from StudentProfile sp
            join Dept d on d.deptId = sp.deptId
            left join ExtraCurricularApplication a
              on a.studentAccountId = sp.accountId
             and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
            left join ExtraCurricularOffering o
              on o.extraOfferingId = a.extraOfferingId
            where sp.accountId = :studentAccountId
            group by
              sp.accountId, sp.name, sp.studentNo,
              d.deptId, d.deptName,
              sp.gradeLevel
        """.formatted(totalPointsExpr, totalHoursExpr);

        List<StudentExtraGradeDetailHeaderResponse> rows =
            em.createQuery(headerJpql, StudentExtraGradeDetailHeaderResponse.class)
              .setParameter("studentAccountId", studentAccountId)
              .getResultList();

        if (rows.isEmpty()) {
            throw new BusinessException(ErrorCode.STUDENT_PROFILE_NOT_FOUND, studentAccountId);
        }

        StudentExtraGradeDetailHeaderResponse base = rows.get(0);
        List<StudentExtraGradeTrendItem> trend = findTrend(studentAccountId);

        return new StudentExtraGradeDetailHeaderResponse(
            base.studentAccountId(),
            base.studentName(),
            base.studentNo(),
            base.deptId(),
            base.deptName(),
            base.gradeLevel(),
            base.totalEarnedPoints(),
            base.totalEarnedHours(),
            trend
        );
    }

    @Override
    public Page<ExtraCurricularGradeListItem> listStudentGradeSummary(
        Long deptId,
        String keyword,
        Pageable pageable
    ) {
        String totalPointsExpr = """
            coalesce(
              cast(
                sum(case
                      when a.completionStatus = com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.PASSED
                      then o.rewardPointDefault else 0 end
                ) as long
              ),
              0
            )
        """;

        String totalHoursExpr = """
            coalesce(
              cast(
                sum(case
                      when a.completionStatus = com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.PASSED
                      then o.recognizedHoursDefault else 0 end
                ) as long
              ),
              0
            )
        """;

        String base = """
            from StudentProfile sp
            join Dept d on d.deptId = sp.deptId
            left join ExtraCurricularApplication a
              on a.studentAccountId = sp.accountId
             and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
            left join ExtraCurricularOffering o on o.extraOfferingId = a.extraOfferingId
            where 1=1
        """;

        String where = "";
        if (deptId != null) {
            where += " and d.deptId = :deptId ";
        }
        if (keyword != null && !keyword.isBlank()) {
            where += """
                and (
                    sp.studentNo like :keyword
                    or sp.name like :keyword
                )
            """;
        }

        String groupBy = """
            group by
              sp.accountId, sp.studentNo,
              d.deptName,
              sp.gradeLevel, sp.name
        """;

        String orderBy = " order by sp.studentNo asc ";

        String contentJpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularGradeListItem(
              sp.accountId,
              sp.studentNo,
              d.deptName,
              sp.gradeLevel,
              sp.name,
              %s,
              %s
            )
        """.formatted(totalPointsExpr, totalHoursExpr) + base + where + groupBy + orderBy;

        String countJpql = """
            select count(sp.accountId)
            from StudentProfile sp
            join Dept d on d.deptId = sp.deptId
            where 1=1
        """ + where;

        TypedQuery<ExtraCurricularGradeListItem> query =
            em.createQuery(contentJpql, ExtraCurricularGradeListItem.class);
        TypedQuery<Long> countQuery =
            em.createQuery(countJpql, Long.class);

        if (deptId != null) {
            query.setParameter("deptId", deptId);
            countQuery.setParameter("deptId", deptId);
        }
        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword + "%";
            query.setParameter("keyword", kw);
            countQuery.setParameter("keyword", kw);
        }

        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<ExtraCurricularGradeListItem> content = query.getResultList();
        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    private List<StudentExtraGradeTrendItem> findTrend(Long studentAccountId) {
        String semesterPointsExpr = """
            coalesce(
              cast(
                sum(case
                      when a.completionStatus = com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.PASSED
                      then o.rewardPointDefault else 0 end
                ) as long
              ),
              0
            )
        """;

        String semesterHoursExpr = """
            coalesce(
              cast(
                sum(case
                      when a.completionStatus = com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.PASSED
                      then o.recognizedHoursDefault else 0 end
                ) as long
              ),
              0
            )
        """;

        String trendJpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraGradeTrendItem(
              s.semesterId,
              s.displayName,
              %s,
              %s
            )
            from ExtraCurricularApplication a
            join ExtraCurricularOffering o on o.extraOfferingId = a.extraOfferingId
            join Semester s on s.semesterId = o.semesterId
            where a.studentAccountId = :studentAccountId
              and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
              and a.completionStatus = com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.PASSED
              and s.term in (
                  com.teamlms.backend.domain.semester.enums.Term.FIRST,
                  com.teamlms.backend.domain.semester.enums.Term.SECOND
              )
            group by s.semesterId, s.displayName, s.year, s.term
            order by s.year asc,
              case
                when s.term = com.teamlms.backend.domain.semester.enums.Term.FIRST then 1
                when s.term = com.teamlms.backend.domain.semester.enums.Term.SECOND then 2
                else 9
              end asc
        """.formatted(semesterPointsExpr, semesterHoursExpr);

        return em.createQuery(trendJpql, StudentExtraGradeTrendItem.class)
            .setParameter("studentAccountId", studentAccountId)
            .getResultList();
    }

    @Override
    public Page<StudentExtraCompletionListItem> listCompletions(
        Long studentAccountId,
        Long semesterId,
        Pageable pageable,
        String keyword
    ) {
        String base = """
            from ExtraCurricularApplication a
            join ExtraCurricularOffering o on o.extraOfferingId = a.extraOfferingId
            join Semester s on s.semesterId = o.semesterId
            where a.studentAccountId = :studentAccountId
              and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
              and a.completionStatus in (
                com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.PASSED,
                com.teamlms.backend.domain.extracurricular.enums.CompletionStatus.FAILED
              )
        """;

        String semesterFilter = (semesterId != null)
            ? " and s.semesterId = :semesterId "
            : "";

        String keywordFilter = "";
        if (keyword != null && !keyword.isBlank()) {
            keywordFilter = """
                and (
                    o.extraOfferingCode like :keyword
                  or o.extraOfferingName like :keyword
                )
            """;
        }

        String orderBy = " order by s.year desc, s.term desc, o.extraOfferingCode asc";

        String contentJpql = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCompletionListItem(
              a.applicationId,
              s.semesterId,
              s.displayName,
              o.extraOfferingCode,
              o.extraOfferingName,
              o.rewardPointDefault,
              o.recognizedHoursDefault,
              a.completionStatus
            )
        """ + base + semesterFilter + keywordFilter + orderBy;

        TypedQuery<StudentExtraCompletionListItem> contentQuery =
            em.createQuery(contentJpql, StudentExtraCompletionListItem.class);

        contentQuery.setParameter("studentAccountId", studentAccountId);
        if (semesterId != null) {
            contentQuery.setParameter("semesterId", semesterId);
        }
        if (keyword != null && !keyword.isBlank()) {
            contentQuery.setParameter("keyword", "%" + keyword + "%");
        }

        contentQuery.setFirstResult((int) pageable.getOffset());
        contentQuery.setMaxResults(pageable.getPageSize());

        List<StudentExtraCompletionListItem> content = contentQuery.getResultList();

        String countJpql = "select count(a.applicationId) " + base + semesterFilter + keywordFilter;
        TypedQuery<Long> countQuery = em.createQuery(countJpql, Long.class);
        countQuery.setParameter("studentAccountId", studentAccountId);
        if (semesterId != null) {
            countQuery.setParameter("semesterId", semesterId);
        }
        if (keyword != null && !keyword.isBlank()) {
            countQuery.setParameter("keyword", "%" + keyword + "%");
        }

        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }
}
