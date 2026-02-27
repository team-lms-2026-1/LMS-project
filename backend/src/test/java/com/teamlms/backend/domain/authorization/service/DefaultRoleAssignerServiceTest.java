package com.teamlms.backend.domain.authorization.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

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
import com.teamlms.backend.domain.authorization.entity.AuthAccountRole;
import com.teamlms.backend.domain.authorization.entity.AuthAccountRoleId;
import com.teamlms.backend.domain.authorization.entity.AuthRole;
import com.teamlms.backend.domain.authorization.repository.AuthAccountRoleRepository;
import com.teamlms.backend.domain.authorization.repository.AuthRoleRepository;

@ExtendWith(MockitoExtension.class)
class DefaultRoleAssignerServiceTest {

    @InjectMocks
    private DefaultRoleAssignerService defaultRoleAssignerService;

    @Mock
    private AuthRoleRepository authRoleRepository;

    @Mock
    private AuthAccountRoleRepository authAccountRoleRepository;

    @Mock
    private AccountRepository accountRepository;

    @Test
    @DisplayName("기본 Role 부여 성공 - 학생 (STUDENT_BASIC)")
    void assignDefaultRole_Success_Student() {
        // given
        Long accountId = 1L;
        Long actorId = 999L;

        AuthRole role = AuthRole.builder().code("STUDENT_BASIC").isActive(true).build();
        ReflectionTestUtils.setField(role, "roleId", 100L);

        when(authRoleRepository.findByCode("STUDENT_BASIC")).thenReturn(Optional.of(role));
        when(authAccountRoleRepository.existsById(any(AuthAccountRoleId.class))).thenReturn(false);

        Account accountRef = Account.builder().build();
        ReflectionTestUtils.setField(accountRef, "accountId", accountId);

        Account actorRef = Account.builder().build();
        ReflectionTestUtils.setField(actorRef, "accountId", actorId);

        when(accountRepository.getReferenceById(accountId)).thenReturn(accountRef);
        when(accountRepository.getReferenceById(actorId)).thenReturn(actorRef);

        // when
        defaultRoleAssignerService.assignDefaultRole(accountId, AccountType.STUDENT, actorId);

        // then
        verify(authAccountRoleRepository, times(1)).save(any(AuthAccountRole.class));
    }

    @Test
    @DisplayName("기본 Role 부여 성공 - 관리자 (ADMIN_SYSTEM), actor 없음")
    void assignDefaultRole_Success_Admin_NoActor() {
        // given
        Long accountId = 2L;

        AuthRole role = AuthRole.builder().code("ADMIN_SYSTEM").isActive(true).build();
        ReflectionTestUtils.setField(role, "roleId", 200L);

        when(authRoleRepository.findByCode("ADMIN_SYSTEM")).thenReturn(Optional.of(role));
        when(authAccountRoleRepository.existsById(any(AuthAccountRoleId.class))).thenReturn(false);

        Account accountRef = Account.builder().build();
        ReflectionTestUtils.setField(accountRef, "accountId", accountId);

        when(accountRepository.getReferenceById(accountId)).thenReturn(accountRef);

        // when
        defaultRoleAssignerService.assignDefaultRole(accountId, AccountType.ADMIN, null);

        // then
        verify(authAccountRoleRepository, times(1)).save(any(AuthAccountRole.class));
        verify(accountRepository, never()).getReferenceById(null);
    }

    @Test
    @DisplayName("기본 Role 부여 방지 - 이미 매핑 존재")
    void assignDefaultRole_Skip_AlreadyExists() {
        // given
        Long accountId = 3L;

        AuthRole role = AuthRole.builder().code("PROFESSOR_BASIC").isActive(true).build();
        ReflectionTestUtils.setField(role, "roleId", 300L);

        when(authRoleRepository.findByCode("PROFESSOR_BASIC")).thenReturn(Optional.of(role));
        when(authAccountRoleRepository.existsById(any(AuthAccountRoleId.class))).thenReturn(true);

        // when
        defaultRoleAssignerService.assignDefaultRole(accountId, AccountType.PROFESSOR, null);

        // then
        verify(accountRepository, never()).getReferenceById(anyLong());
        verify(authAccountRoleRepository, never()).save(any(AuthAccountRole.class));
    }

    @Test
    @DisplayName("기본 Role 부여 실패 - DB에 Role이 없는 경우")
    void assignDefaultRole_Fail_RoleNotFound() {
        // given
        when(authRoleRepository.findByCode(anyString())).thenReturn(Optional.empty());

        // when & then
        assertThrows(IllegalStateException.class,
                () -> defaultRoleAssignerService.assignDefaultRole(1L, AccountType.STUDENT, null));
    }

    @Test
    @DisplayName("기본 Role 부여 실패 - Role이 비활성화 상태인 경우")
    void assignDefaultRole_Fail_RoleInactive() {
        // given
        AuthRole role = AuthRole.builder().code("STUDENT_BASIC").isActive(false).build();

        when(authRoleRepository.findByCode(anyString())).thenReturn(Optional.of(role));

        // when & then
        assertThrows(IllegalStateException.class,
                () -> defaultRoleAssignerService.assignDefaultRole(1L, AccountType.STUDENT, null));
    }
}
