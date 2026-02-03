package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import com.teamlms.backend.domain.curricular.api.dto.CurricularGradeListItem;
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
              0L
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

        // ✅ Long 타입 강제 (Hibernate 타입추론 이슈 방어)
        String semesterEarnedCreditsExpr = """
            coalesce(
              cast(
                sum(case
                      when e.completionStatus = com.teamlms.backend.domain.curricular.enums.CompletionStatus.PASSED
                      then c.credits else 0 end
                ) as long
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
        """.formatted(semesterGpaExpr, semesterEarnedCreditsExpr);

        return em.createQuery(trendJpql, StudentGradeTrendItem.class)
            .setParameter("studentAccountId", studentAccountId)
            .getResultList();
    }

    @Override
    public Page<StudentCourseGradeListItem> listCurricular(
            Long studentAccountId,
            Long semesterId,
            Pageable pageable,
            String keyword
    ) {

        String base = """
            from Enrollment e
            join CurricularOffering o on o.offeringId = e.offeringId
            join Curricular c on c.curricularId = o.curricularId
            join Semester s on s.semesterId = o.semesterId
            where e.studentAccountId = :studentAccountId
              and e.enrollmentStatus = com.teamlms.backend.domain.curricular.enums.EnrollmentStatus.ENROLLED
              and e.isGradeConfirmed = true
        """;

        String semesterFilter = (semesterId != null)
                ? " and s.semesterId = :semesterId "
                : "";

        String keywordFilter = "";
        if (keyword != null && !keyword.isBlank()) {
            keywordFilter = """
                and (
                    c.curricularCode like :keyword
                  or c.curricularName like :keyword
                )
            """;
        }

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
        """ + base + semesterFilter + keywordFilter + orderBy;

        TypedQuery<StudentCourseGradeListItem> contentQuery =
                em.createQuery(contentJpql, StudentCourseGradeListItem.class);

        contentQuery.setParameter("studentAccountId", studentAccountId);

        if (semesterId != null) {
            contentQuery.setParameter("semesterId", semesterId);
        }

        if (keyword != null && !keyword.isBlank()) {
            contentQuery.setParameter("keyword", "%" + keyword + "%");
        }

        contentQuery.setFirstResult((int) pageable.getOffset());
        contentQuery.setMaxResults(pageable.getPageSize());

        List<StudentCourseGradeListItem> content = contentQuery.getResultList();

        String countJpql =
                "select count(e.enrollmentId) " + base + semesterFilter + keywordFilter;

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

    @Override
    public Page<CurricularGradeListItem> listCurricularGrade(
            Long deptId,
            String keyword,
            Pageable pageable
    ) {

        // A=5 ... F=0 (Double)  ※ getDetailHeader()와 동일
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

        // 학점가중평균 GPA  ※ getDetailHeader()와 동일
        String overallGpaExpr = """
            coalesce(
              (sum(c.credits * (%s)) / nullif(sum(c.credits), 0)),
              0.0
            )
        """.formatted(gradePointExpr);

        String base = """
            from StudentProfile sp
            join Dept d on d.deptId = sp.deptId
            left join Enrollment e
              on e.studentAccountId = sp.accountId
            and e.enrollmentStatus = com.teamlms.backend.domain.curricular.enums.EnrollmentStatus.ENROLLED
            and e.isGradeConfirmed = true
            left join CurricularOffering o on o.offeringId = e.offeringId
            left join Curricular c on c.curricularId = o.curricularId
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

        // ⚠️ enrollmentId 자리에 뭘 넣을지 결정 필요
        // 학생별 목록이면 enrollmentId가 의미가 없으니, 여기서는 sp.accountId를 넣는 게 현실적
        String contentJpql = """
            select new com.teamlms.backend.domain.curricular.api.dto.CurricularGradeListItem(
              sp.accountId,
              sp.studentNo,
              d.deptName,
              sp.gradeLevel,
              sp.name,
              %s
            )
        """.formatted(overallGpaExpr) + base + where + groupBy + orderBy;

        String countJpql = """
            select count(sp.accountId)
            from StudentProfile sp
            join Dept d on d.deptId = sp.deptId
            where 1=1
        """ + where;

        TypedQuery<CurricularGradeListItem> query =
                em.createQuery(contentJpql, CurricularGradeListItem.class);

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

        List<CurricularGradeListItem> content = query.getResultList();
        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

}
