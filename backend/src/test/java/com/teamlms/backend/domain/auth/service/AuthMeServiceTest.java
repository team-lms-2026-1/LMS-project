package com.teamlms.backend.domain.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.auth.api.dto.AuthMeResponse;
import com.teamlms.backend.domain.auth.repository.AuthPermissionQueryRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class AuthMeServiceTest {

    @InjectMocks
    private AuthMeService authMeService;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AuthPermissionQueryRepository authPermissionQueryRepository;

    @Test
    @DisplayName("계정 본인 확인(AuthMeResponse 반환) 성공")
    void me_Success() {
        // given
        Long accountId = 1L;
        Account account = Account.builder().loginId("user1").accountType(AccountType.STUDENT).build();
        ReflectionTestUtils.setField(account, "accountId", accountId);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        List<String> mockPermissions = List.of("READ_PRIVILEGES", "WRITE_PRIVILEGES");
        when(authPermissionQueryRepository.findPermissionCodesByAccountId(accountId)).thenReturn(mockPermissions);

        // when
        AuthMeResponse response = authMeService.me(accountId);

        // then
        assertNotNull(response);
        assertEquals(1L, response.getAccountId());
        assertEquals("user1", response.getLoginId());
        assertEquals("STUDENT", response.getAccountType());

        assertNotNull(response.getPermissionCodes());
        assertEquals(2, response.getPermissionCodes().size());
        assertTrue(response.getPermissionCodes().contains("READ_PRIVILEGES"));

        verify(accountRepository, times(1)).findById(accountId);
        verify(authPermissionQueryRepository, times(1)).findPermissionCodesByAccountId(accountId);
    }

    @Test
    @DisplayName("계정 본인 확인 실패 - 계정이 존재하지 않음")
    void me_Fail_AccountNotFound() {
        // given
        Long accountId = 1L;
        when(accountRepository.findById(accountId)).thenReturn(Optional.empty());

        // when & then
        assertThrows(BusinessException.class, () -> authMeService.me(accountId));

        verify(authPermissionQueryRepository, never()).findPermissionCodesByAccountId(anyLong());
    }
}
