package com.teamlms.backend.domain.auth.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.service.AccountService;
import com.teamlms.backend.domain.auth.dto.LoginResult;
import com.teamlms.backend.domain.authorization.service.AuthorizationLoaderService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AccountService accountService;
    private final AuthorizationLoaderService authorizationLoaderService;

    public LoginResult login(String loginId, String password) {

        // 1. 인증(Authentication)
        Account account = accountService.authenticate(loginId, password);

        // 2. 인가(Authorization) 정보 로딩
        var permissionCodes =
                authorizationLoaderService.loadActivePermissionCodes(account.getAccountId());

        // 3. Security/JWT에서 바로 쓸 수 있게 묶어서 반환
        return new LoginResult(account, permissionCodes);
    }
}
