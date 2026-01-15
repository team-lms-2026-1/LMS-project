package com.teamlms.backend.domain.auth.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AccountService accountService;

    public Account login(String loginId, String password) {
        return accountService.authenticate(loginId, password);
    }
}
