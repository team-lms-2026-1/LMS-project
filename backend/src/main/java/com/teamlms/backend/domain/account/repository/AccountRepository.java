package com.teamlms.backend.domain.account.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.account.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByLoginId(String string);

    boolean exiexistsByLoginId(String loginId);
}
