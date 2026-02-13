package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.dept.api.dto.DeptStudentListItem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
  boolean existsByStudentNo(String studentNo);

  List<StudentProfile> findByDeptId(Long deptId);

  // 상세페이지 학생
  @Query("""
          select new com.teamlms.backend.domain.dept.api.dto.DeptStudentListItem(
              s.accountId,
              s.studentNo,
              s.name,
              s.gradeLevel,
              s.academicStatus,
              m.majorName
          )
          from StudentProfile s
            join StudentMajor sm
              on sm.id.studentAccountId = s.accountId
             and sm.majorType = com.teamlms.backend.domain.dept.enums.MajorType.PRIMARY
            join Major m
              on m.majorId = sm.id.majorId
          where m.deptId = :deptId
            and (
              coalesce(:keyword, '') = ''
              or lower(s.name) like lower(concat('%', coalesce(:keyword, ''), '%'))
              or lower(s.studentNo) like lower(concat('%', coalesce(:keyword, ''), '%'))
            )
      """)
  Page<DeptStudentListItem> searchDeptStudents(
      @Param("deptId") Long deptId,
      @Param("keyword") String keyword,
      Pageable pageable);
}
