package com.teamlms.backend.domain.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.service.AccountService;
import com.teamlms.backend.domain.auth.dto.LoginResult;
import com.teamlms.backend.domain.authorization.service.AuthorizationLoaderService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private AccountService accountService;

    @Mock
    private AuthorizationLoaderService authorizationLoaderService;

    @Test
    @DisplayName("로그인 처리를 통한 LoginResult 변환 성공 테스트")
    void login_Success() {
        // given
        String loginId = "user1";
        String password = "password123";

        Account mockAccount = Account.builder().loginId(loginId).build();
        ReflectionTestUtils.setField(mockAccount, "accountId", 1L);

        when(accountService.authenticate(loginId, password)).thenReturn(mockAccount);

        Set<String> mockPermissions = Set.of("READ_PRIVILEGES", "WRITE_PRIVILEGES");
        when(authorizationLoaderService.loadActivePermissionCodes(1L)).thenReturn(mockPermissions);

        // when
        LoginResult result = authService.login(loginId, password);

        // then
        assertNotNull(result);
        assertEquals(1L, result.account().getAccountId());
        assertEquals(loginId, result.account().getLoginId());

        assertNotNull(result.permissionCodes());
        assertEquals(2, result.permissionCodes().size());
        assertTrue(result.permissionCodes().contains("READ_PRIVILEGES"));
        assertTrue(result.permissionCodes().contains("WRITE_PRIVILEGES"));

        verify(accountService, times(1)).authenticate(loginId, password);
        verify(authorizationLoaderService, times(1)).loadActivePermissionCodes(1L);
    }
}
