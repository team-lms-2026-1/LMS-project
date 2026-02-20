package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.competency.entitiy.SemesterStudentCompetencySummary;
import com.teamlms.backend.domain.account.enums.AcademicStatus;

import java.util.List;
import java.util.Optional;

public interface SemesterStudentCompetencySummaryRepository
    extends JpaRepository<SemesterStudentCompetencySummary, Long> {

  // ?뱀젙 ?숆린, ?뱀젙 ?숈깮????웾 ?붿빟 紐⑸줉 議고쉶
  List<SemesterStudentCompetencySummary> findBySemesterSemesterIdAndStudentAccountId(
      Long semesterId,
      Long studentAccountId);

  // ?뱀젙 ?숆린, ?뱀젙 ?숈깮, ?뱀젙 ??웾 ?붿빟 議고쉶
  Optional<SemesterStudentCompetencySummary> findBySemesterSemesterIdAndStudentAccountIdAndCompetencyCompetencyId(
      Long semesterId,
      Long studentAccountId,
      Long competencyId);

  // ?뱀젙 ?숆린 ?꾩껜 ?숈깮 ?붿빟 議고쉶
  List<SemesterStudentCompetencySummary> findBySemesterSemesterId(Long semesterId);

  // ?뱀젙 ?숆린 ?꾩껜 ?숈깮 ?붿빟 ??젣
  void deleteBySemesterSemesterId(Long semesterId);

  // ?뱀젙 ?숈깮???꾩껜 ?숆린 ??웾 ?대젰 議고쉶
  List<SemesterStudentCompetencySummary> findByStudentAccountId(Long studentAccountId);

  // ?뱀젙 ?숆린, ?뱀젙 ?숈쟻 ?곹깭 ?숈깮???붿빟 紐⑸줉 議고쉶
  @Query("""
      SELECT s
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId = :semesterId
        AND p.academicStatus = :status
      """)
  List<SemesterStudentCompetencySummary> findBySemesterSemesterIdAndAcademicStatus(
      @Param("semesterId") Long semesterId,
      @Param("status") AcademicStatus status);

  // ?뱀젙 ?숈깮???꾩껜 ?숆린 ??웾 ?대젰 議고쉶
  @Query("""
          SELECT s
          FROM SemesterStudentCompetencySummary s
          WHERE s.student.accountId = :studentAccountId
          ORDER BY s.semester.semesterId DESC, s.competency.sortOrder ASC
      """)
  List<SemesterStudentCompetencySummary> findByStudentAccountIdOrderBySemester(
      @Param("studentAccountId") Long studentAccountId);

  // ?뱀젙 ?숆린, ?뱀젙 ??웾, ?뱀젙 ?숆낵???됯퇏 ?먯닔 議고쉶
  @Query("""
      SELECT AVG(s.totalScore)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId = :semesterId
        AND s.competency.competencyId = :competencyId
        AND p.deptId = :deptId
      """)
  Double getDepartmentAverageScore(
      @Param("semesterId") Long semesterId,
      @Param("competencyId") Long competencyId,
      @Param("deptId") Long deptId);

  // ?뱀젙 ?숆린, ?뱀젙 ?숈쟻 ?곹깭 ?숈깮???곗텧 ??곸옄 ??
  @Query("""
      SELECT COUNT(DISTINCT s.student.accountId)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId = :semesterId
        AND p.academicStatus = :status
      """)
  long countDistinctStudentsBySemesterAndAcademicStatus(
      @Param("semesterId") Long semesterId,
      @Param("status") AcademicStatus status);

  // ?뱀젙 ?숆린, ?뱀젙 ?숈쟻 ?곹깭 ?숈깮??吏꾨떒 ?먯닔 ?됯퇏
  @Query("""
      SELECT AVG(s.diagnosisScore)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId = :semesterId
        AND p.academicStatus = :status
      """)
  Double getSemesterAverageDiagnosisScoreByAcademicStatus(
      @Param("semesterId") Long semesterId,
      @Param("status") AcademicStatus status);

  // ?뱀젙 ?숆린, ?뱀젙 ?숈쟻 ?곹깭 ?숈깮??total ?먯닔 ?됯퇏
  @Query("""
      SELECT AVG(s.totalScore)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId = :semesterId
        AND p.academicStatus = :status
      """)
  Double getSemesterAverageTotalScoreByAcademicStatus(
      @Param("semesterId") Long semesterId,
      @Param("status") AcademicStatus status);

  // ?뱀젙 ?숆린 ??紐⑤뱺 ?숆낵 * ??웾蹂??됯퇏 ?먯닔
  @Query("""
      SELECT p.deptId, s.competency.competencyId, AVG(s.diagnosisScore)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId = :semesterId
        AND p.academicStatus = :status
      GROUP BY p.deptId, s.competency.competencyId
      """)
  List<Object[]> findDeptCompetencyAverages(
      @Param("semesterId") Long semesterId,
      @Param("status") AcademicStatus status);

  // ?뱀젙 ?숆린 ??紐⑤뱺 ?숆낵 * ??웾 total ?됯퇏 ?먯닔
  @Query("""
      SELECT p.deptId, s.competency.competencyId, AVG(s.totalScore)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId = :semesterId
        AND p.academicStatus = :status
      GROUP BY p.deptId, s.competency.competencyId
      """)
  List<Object[]> findDeptCompetencyTotalScoreAverages(
      @Param("semesterId") Long semesterId,
      @Param("status") AcademicStatus status);

  // ?щ윭 ?숆린 ???숆낵蹂??됯퇏 ?먯닔 (?꾩껜 異붿씠 ?됯퇏)
  @Query("""
      SELECT s.semester.semesterId, p.deptId, AVG(s.diagnosisScore)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId IN :semesterIds
        AND p.academicStatus = :status
      GROUP BY s.semester.semesterId, p.deptId
      """)
  List<Object[]> findDeptSemesterAverages(
      @Param("semesterIds") List<Long> semesterIds,
      @Param("status") AcademicStatus status);

  // ?щ윭 ?숆린 ???숆낵蹂???웾 ?됯퇏 ?먯닔 (6CS 異붿씠 鍮꾧탳)
  @Query("""
      SELECT s.semester.semesterId, p.deptId, s.competency.competencyId, AVG(s.diagnosisScore)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId IN :semesterIds
        AND p.academicStatus = :status
      GROUP BY s.semester.semesterId, p.deptId, s.competency.competencyId
      """)
  List<Object[]> findDeptSemesterCompetencyAverages(
      @Param("semesterIds") List<Long> semesterIds,
      @Param("status") AcademicStatus status);

  // ?щ윭 ?숆린 ???숆낵蹂???웾 total ?됯퇏 ?먯닔 (6CS 異붿씠 鍮꾧탳)
  @Query("""
      SELECT s.semester.semesterId, p.deptId, s.competency.competencyId, AVG(s.totalScore)
      FROM SemesterStudentCompetencySummary s
      JOIN StudentProfile p ON s.student.accountId = p.accountId
      WHERE s.semester.semesterId IN :semesterIds
        AND p.academicStatus = :status
      GROUP BY s.semester.semesterId, p.deptId, s.competency.competencyId
      """)
  List<Object[]> findDeptSemesterCompetencyTotalScoreAverages(
      @Param("semesterIds") List<Long> semesterIds,
      @Param("status") AcademicStatus status);

  // ?뱀젙 ?숆린, ?뱀젙 ??웾??紐⑤뱺 ?숈깮 ?먯닔 議고쉶
  @Query("""
          SELECT s
          FROM SemesterStudentCompetencySummary s
          WHERE s.semester.semesterId = :semesterId
            AND s.competency.competencyId = :competencyId
          ORDER BY s.totalScore DESC
      """)
  List<SemesterStudentCompetencySummary> findBySemesterAndCompetencyOrderByScore(
      @Param("semesterId") Long semesterId,
      @Param("competencyId") Long competencyId);
}
