package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.curricular.api.dto.StudentCourseGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentGradeDetailHeaderResponse;
import com.teamlms.backend.domain.curricular.api.dto.StudentGradeTrendItem;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class StudentGradeReportRepositoryImpl implements StudentGradeReportRepositoryCustom {

    private final EntityManager em;

    @Override
    public StudentGradeDetailHeaderResponse getDetailHeader(Long studentAccountId) {

        // A=5 ... F=0 (Double)
        String gradePointExpr = """
            case e.grade
              when 'A' then 5.0
              when 'B' then 4.0
              when 'C' then 3.0
              when 'D' then 2.0
              when 'E' then 1.0
              when 'F' then 0.0
              else null
            end
        """;

        String overallGpaExpr = """
            coalesce(
              (sum(c.credits * (%s)) / nullif(sum(c.credits), 0)),
              0.0
            )
        """.formatted(gradePointExpr);

        // ✅ PASSED만 학점 취득 (total earned credits)
        String totalEarnedCreditsExpr = """
            coalesce(
              sum(case
                    when e.completionStatus = com.teamlms.backend.domain.curricular.enums.CompletionStatus.PASSED
                    then c.credits else 0 end
              ),
              0
            )
        """;

        // ✅ JPQL 안에 주석 절대 넣지 말기
        String headerJpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.StudentGradeDetailHeaderResponse(
              sp.accountId,
              sp.name,
              sp.studentNo,
              d.deptId,
              d.deptName,
              sp.gradeLevel,
              0.0,
              %s,
              %s,
              null
            )
            from StudentProfile sp
            join Dept d on d.deptId = sp.deptId
            left join Enrollment e
              on e.studentAccountId = sp.accountId
             and e.enrollmentStatus = com.teamlms.backend.domain.curricular.enums.EnrollmentStatus.ENROLLED
             and e.isGradeConfirmed = true
            left join CurricularOffering o on o.offeringId = e.offeringId
            left join Curricular c on c.curricularId = o.curricularId
            where sp.accountId = :studentAccountId
            group by
              sp.accountId, sp.name, sp.studentNo,
              d.deptId, d.deptName,
              sp.gradeLevel
        """.formatted(overallGpaExpr, totalEarnedCreditsExpr);

        List<StudentGradeDetailHeaderResponse> rows =
            em.createQuery(headerJpql, StudentGradeDetailHeaderResponse.class)
              .setParameter("studentAccountId", studentAccountId)
              .getResultList();

        if (rows.isEmpty()) {
            throw new BusinessException(ErrorCode.STUDENT_PROFILE_NOT_FOUND, studentAccountId);
        }

        StudentGradeDetailHeaderResponse base = rows.get(0);

        List<StudentGradeTrendItem> trend = findTrend(studentAccountId, gradePointExpr);

        double maxSemesterGpa = trend.stream()
            .mapToDouble(t -> t.semesterGpa() == null ? 0.0 : t.semesterGpa())
            .max()
            .orElse(0.0);

        return new StudentGradeDetailHeaderResponse(
            base.studentAccountId(),
            base.studentName(),
            base.studentNo(),
            base.deptId(),
            base.deptName(),
            base.gradeLevel(),
            maxSemesterGpa,
            base.overallGpa(),
            base.totalEarnedCredits(),
            trend
        );
    }

    private List<StudentGradeTrendItem> findTrend(Long studentAccountId, String gradePointExpr) {

        String semesterGpaExpr = """
            coalesce(
              (sum(c.credits * (%s)) / nullif(sum(c.credits), 0)),
              0.0
            )
        """.formatted(gradePointExpr);

        String semesterEarnedCreditsExpr = """
            coalesce(
              sum(case
                    when e.completionStatus = com.teamlms.backend.domain.curricular.enums.CompletionStatus.PASSED
                    then c.credits else 0 end
              ),
              0
            )
        """;

        String trendJpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.StudentGradeTrendItem(
              s.semesterId,
              s.displayName,
              %s,
              %s
            )
            from Enrollment e
            join CurricularOffering o on o.offeringId = e.offeringId
            join Curricular c on c.curricularId = o.curricularId
            join Semester s on s.semesterId = o.semesterId
            where e.studentAccountId = :studentAccountId
              and e.enrollmentStatus = com.teamlms.backend.domain.curricular.enums.EnrollmentStatus.ENROLLED
              and e.isGradeConfirmed = true
            group by s.semesterId, s.displayName, s.year, s.term
            order by s.year asc, s.term asc
        """.formatted(semesterGpaExpr, semesterEarnedCreditsExpr);

        return em.createQuery(trendJpql, StudentGradeTrendItem.class)
            .setParameter("studentAccountId", studentAccountId)
            .getResultList();
    }

    @Override
    public Page<StudentCourseGradeListItem> listCurricular(Long studentAccountId, Long semesterId, Pageable pageable) {

        String base = """
            from Enrollment e
            join CurricularOffering o on o.offeringId = e.offeringId
            join Curricular c on c.curricularId = o.curricularId
            join Semester s on s.semesterId = o.semesterId
            where e.studentAccountId = :studentAccountId
              and e.enrollmentStatus = com.teamlms.backend.domain.curricular.enums.EnrollmentStatus.ENROLLED
              and e.isGradeConfirmed = true
        """;

        String filter = (semesterId != null) ? " and s.semesterId = :semesterId" : "";
        String orderBy = " order by s.year desc, s.term desc, c.curricularCode asc";

        String contentJpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.StudentCourseGradeListItem(
              e.enrollmentId,
              s.semesterId,
              s.displayName,
              c.curricularCode,
              c.curricularName,
              c.credits,
              e.grade
            )
        """ + base + filter + orderBy;

        TypedQuery<StudentCourseGradeListItem> contentQuery =
            em.createQuery(contentJpql, StudentCourseGradeListItem.class);

        contentQuery.setParameter("studentAccountId", studentAccountId);
        if (semesterId != null) contentQuery.setParameter("semesterId", semesterId);

        contentQuery.setFirstResult((int) pageable.getOffset());
        contentQuery.setMaxResults(pageable.getPageSize());

        List<StudentCourseGradeListItem> content = contentQuery.getResultList();

        String countJpql = "select count(e.enrollmentId) " + base + filter;

        TypedQuery<Long> countQuery = em.createQuery(countJpql, Long.class);
        countQuery.setParameter("studentAccountId", studentAccountId);
        if (semesterId != null) countQuery.setParameter("semesterId", semesterId);

        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }
}
