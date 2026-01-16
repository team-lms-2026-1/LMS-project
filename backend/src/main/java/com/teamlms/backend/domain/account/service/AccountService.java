package com.teamlms.backend.domain.account.service;

import com.teamlms.backend.domain.account.api.dto.AdminAccountListItem;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.global.exception.AccountInactiveException;
import com.teamlms.backend.global.exception.AccountNotFoundException;
import com.teamlms.backend.global.exception.AuthenticationFailedException;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 계정 검증 ( 조회/상태/비번)
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public Account getByLoginIdOrThrow(String loginId) {
        return accountRepository.findByLoginId(loginId)
                .orElseThrow(() -> new AccountNotFoundException(loginId));
    }

    public void validateActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountInactiveException(account.getAccountId());
        }
    }

    public void validatePassword(Account account, String rawPassword) {
        if (!passwordEncoder.matches(rawPassword, account.getPasswordHash())) {
            throw new AuthenticationFailedException();
        }
    }

    /**
     * 로그인 인증 (계정 조회 -> 상태 검증 -> 비밀번호 검증)
     */
    public Account authenticate(String loginId, String rawPassword) {
        Account account = getByLoginIdOrThrow(loginId);
        validateActive(account);
        validatePassword(account, rawPassword);
        return account;
    }

    // 목록 조회
    public Page<AdminAccountListItem> adminList(
            String keyword,
            AccountType accountType,
            Pageable pageable
    ) {
        return accountRepository.searchAccounts(keyword, accountType, pageable);
    }
}