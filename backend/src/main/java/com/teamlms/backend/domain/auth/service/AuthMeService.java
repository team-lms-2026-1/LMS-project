package com.teamlms.backend.domain.auth.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.auth.api.dto.AuthMeResponse;
import com.teamlms.backend.domain.auth.repository.AuthPermissionQueryRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthMeService {

    private final AccountRepository accountRepository;
    private final AuthPermissionQueryRepository authPermissionQueryRepository;

    @Transactional(readOnly = true)
    public AuthMeResponse me(Long accountId) {

        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        List<String> permissionCodes = authPermissionQueryRepository.findPermissionCodesByAccountId(accountId);

        return AuthMeResponse.builder()
            .accountId(account.getAccountId())
            .loginId(account.getLoginId())
            .accountType(account.getAccountType().name())
            .permissionCodes(permissionCodes)
            .build();
    }

    // ... 기존 login()
}
