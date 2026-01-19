package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long>, AccountRepositoryCustom {

    Optional<Account> findByLoginId(String string);

    boolean existsByLoginId(String loginId);

    // Student 목록

}
