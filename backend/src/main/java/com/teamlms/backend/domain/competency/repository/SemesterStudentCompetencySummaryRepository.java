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

  // 특정 학기, 특정 학생의 역량 요약 목록 조회
  List<SemesterStudentCompetencySummary> findBySemesterSemesterIdAndStudentAccountId(
      Long semesterId,
      Long studentAccountId);

  // 특정 학기, 특정 학생, 특정 역량 요약 조회
  Optional<SemesterStudentCompetencySummary> findBySemesterSemesterIdAndStudentAccountIdAndCompetencyCompetencyId(
      Long semesterId,
      Long studentAccountId,
      Long competencyId);

  // 특정 학기 전체 학생 요약 조회
  List<SemesterStudentCompetencySummary> findBySemesterSemesterId(Long semesterId);

  // 특정 학기 전체 학생 요약 삭제
  void deleteBySemesterSemesterId(Long semesterId);

  // 특정 학생의 전체 학기 역량 이력 조회
  List<SemesterStudentCompetencySummary> findByStudentAccountId(Long studentAccountId);

  // 특정 학기, 특정 학적 상태 학생의 요약 목록 조회
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

  // 특정 학생의 전체 학기 역량 이력 조회
  @Query("""
          SELECT s
          FROM SemesterStudentCompetencySummary s
          WHERE s.student.accountId = :studentAccountId
          ORDER BY s.semester.semesterId DESC, s.competency.sortOrder ASC
      """)
  List<SemesterStudentCompetencySummary> findByStudentAccountIdOrderBySemester(
      @Param("studentAccountId") Long studentAccountId);

  // 특정 학기, 특정 역량, 특정 학과의 평균 점수 조회
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

  // 특정 학기, 특정 학적 상태 학생의 산출 대상자 수
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

  // 특정 학기, 특정 학적 상태 학생의 진단 점수 평균
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

  // 특정 학기 내 모든 학과 * 역량별 평균 점수
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

  // 여러 학기 내 학과별 평균 점수 (전체 추이 평균)
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

  // 여러 학기 내 학과별 역량 평균 점수 (6CS 추이 비교)
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

  // 특정 학기, 특정 역량의 모든 학생 점수 조회
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
