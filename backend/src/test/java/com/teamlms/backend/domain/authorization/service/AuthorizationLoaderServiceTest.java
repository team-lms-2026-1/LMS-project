package com.teamlms.backend.domain.authorization.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.authorization.repository.AuthorizationQueryRepository;

@ExtendWith(MockitoExtension.class)
class AuthorizationLoaderServiceTest {

    @InjectMocks
    private AuthorizationLoaderService authorizationLoaderService;

    @Mock
    private AuthorizationQueryRepository authorizationQueryRepository;

    @Test
    @DisplayName("계정에 활성화된 권한 코드(Permission Code) 로드 테스트")
    void loadActivePermissionCodes_Success() {
        // given
        Long accountId = 1L;
        Set<String> expectedPermissions = Set.of("DEPT_MANAGE", "NOTICE_READ");

        when(authorizationQueryRepository.findActivePermissionCodes(accountId)).thenReturn(expectedPermissions);

        // when
        Set<String> result = authorizationLoaderService.loadActivePermissionCodes(accountId);

        // then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains("DEPT_MANAGE"));
        assertTrue(result.contains("NOTICE_READ"));

        verify(authorizationQueryRepository, times(1)).findActivePermissionCodes(accountId);
    }

    @Test
    @DisplayName("계정에 활성화된 역할 코드(Role Code) 로드 테스트")
    void loadActiveRoleCodes_Success() {
        // given
        Long accountId = 2L;
        Set<String> expectedRoles = Set.of("STUDENT_BASIC", "SYSTEM_ADMIN");

        when(authorizationQueryRepository.findActiveRoleCodes(accountId)).thenReturn(expectedRoles);

        // when
        Set<String> result = authorizationLoaderService.loadActiveRoleCodes(accountId);

        // then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains("STUDENT_BASIC"));
        assertTrue(result.contains("SYSTEM_ADMIN"));

        verify(authorizationQueryRepository, times(1)).findActiveRoleCodes(accountId);
    }
}
