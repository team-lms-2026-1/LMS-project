package com.teamlms.backend.domain.mypage.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.curricular.entity.Enrollment;
import com.teamlms.backend.domain.mypage.dto.TimetableInfo;
import com.teamlms.backend.domain.semester.enums.Term;

public interface MyPageTimetableRepository extends JpaRepository<Enrollment, Long> {

    @Query("""
            SELECT new com.teamlms.backend.domain.mypage.dto.TimetableInfo(
                c.curricularName,
                c.curricularCode,
                CAST(o.dayOfWeek AS string),
                o.period,
                o.location,
                p.name
            )
            FROM Enrollment e
            JOIN CurricularOffering o ON e.offeringId = o.offeringId
            JOIN Curricular c ON o.curricularId = c.curricularId
            JOIN Semester s ON o.semesterId = s.semesterId
            LEFT JOIN ProfessorProfile p ON o.professorAccountId = p.accountId
            WHERE e.studentAccountId = :studentAccountId
              AND s.year = :year
              AND s.term = :term
              AND e.enrollmentStatus = com.teamlms.backend.domain.curricular.enums.EnrollmentStatus.ENROLLED
            ORDER BY o.dayOfWeek, o.period
            """)
    List<TimetableInfo> findTimetableBySemester(
            @Param("studentAccountId") Long studentAccountId,
            @Param("year") Integer year,
            @Param("term") Term term);
}
