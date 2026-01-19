package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.ProfessorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProfessorProfileRepository extends JpaRepository<ProfessorProfile, Long> {
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
}
