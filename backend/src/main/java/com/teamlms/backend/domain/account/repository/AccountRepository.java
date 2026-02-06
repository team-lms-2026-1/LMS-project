package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long>, AccountRepositoryCustom {

    Optional<Account> findByLoginId(String string);

    List<Account> findAllByAccountType(AccountType accountType);

    boolean existsByLoginId(String loginId);

    // Student 목록
    // 학생(StudentProfile) 기준으로 해당 학과에 속한 계정들을 조회하는 쿼리입니다.
    @Query("SELECT a FROM Account a WHERE a.accountId IN (SELECT sp.accountId FROM StudentProfile sp WHERE sp.deptId IN :deptIds)")
    List<Account> findAllByDeptIdIn(@Param("deptIds") List<Long> deptIds);

    // 학년별 조회
    @Query("SELECT a FROM Account a WHERE a.accountId IN (SELECT sp.accountId FROM StudentProfile sp WHERE sp.gradeLevel IN :gradeLevels)")
    List<Account> findAllByGradeLevelIn(@Param("gradeLevels") List<Integer> gradeLevels);

    // 학과 + 학년 동시 조회 (교집합)
    @Query("SELECT a FROM Account a WHERE a.accountId IN (SELECT sp.accountId FROM StudentProfile sp WHERE sp.deptId IN :deptIds AND sp.gradeLevel IN :gradeLevels)")
    List<Account> findAllByDeptIdInAndGradeLevelIn(@Param("deptIds") List<Long> deptIds,
            @Param("gradeLevels") List<Integer> gradeLevels);
}
