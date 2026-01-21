package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.ProfessorProfile;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProfessorProfileRepository extends JpaRepository<ProfessorProfile, Long>, ProfessorProfileRepositoryCustom {
    boolean existsByProfessorNo(String professorNo);

    @Query("""
        select (count(p) > 0)
        from ProfessorProfile p
        join Account a on a.accountId = p.accountId
        where p.deptId = :deptId
          and a.status = 'ACTIVE'
          and a.accountType = 'PROFESSOR'
    """)
    boolean existsActiveProfessorByDeptId(@Param("deptId") Long deptId);

    // 학과 수정 담당교수 검증
    boolean existsByAccountIdAndDeptId(Long accountId, Long deptId);

    // 상세페이지 ( 교수 목록 )
    @Query("""
        select p
        from ProfessorProfile p
        where p.deptId = :deptId
          and (
            coalesce(:keyword, '') = ''
            or lower(p.name) like lower(concat('%', coalesce(:keyword, ''), '%'))
            or lower(p.professorNo) like lower(concat('%', coalesce(:keyword, ''), '%'))
          )
    """)
    Page<ProfessorProfile> searchByDeptId(
            @Param("deptId") Long deptId,
            @Param("keyword") String keyword,
            Pageable pageable
    );


}
