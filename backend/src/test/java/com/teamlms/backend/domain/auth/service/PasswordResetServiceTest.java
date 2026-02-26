package com.teamlms.backend.domain.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.auth.entity.PasswordResetToken;
import com.teamlms.backend.domain.auth.repository.PasswordResetTokenRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @InjectMocks
    private PasswordResetService passwordResetService;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordResetMailService mailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(passwordResetService, "tokenTtlSeconds", 1800L);
    }

    @Test
    @DisplayName("비밀번호 재설정 요청 성공")
    void requestReset_Success() {
        // given
        String email = "test@example.com";
        String clientIp = "127.0.0.1";
        Long accountId = 1L;

        Account account = Account.builder().status(AccountStatus.ACTIVE).build();
        ReflectionTestUtils.setField(account, "accountId", accountId);

        when(accountRepository.findAccountIdByEmail(email)).thenReturn(accountId);
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        // when
        passwordResetService.requestReset(email, clientIp);

        // then
        verify(tokenRepository, times(1)).markAllUnusedAsUsed(eq(accountId), any(LocalDateTime.class));
        verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(mailService, times(1)).sendResetLink(eq(email), anyString());
    }

    @Test
    @DisplayName("비밀번호 재설정 요청 무시 - 이메일 존재 안함")
    void requestReset_Ignored_EmailNotFound() {
        // given
        String email = "notfound@example.com";
        String clientIp = "127.0.0.1";

        when(accountRepository.findAccountIdByEmail(email)).thenReturn(null);

        // when
        passwordResetService.requestReset(email, clientIp);

        // then
        verify(accountRepository, never()).findById(anyLong());
        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("비밀번호 재설정 요청 무시 - 계정 비활성화")
    void requestReset_Ignored_AccountInactive() {
        // given
        String email = "test@example.com";
        String clientIp = "127.0.0.1";
        Long accountId = 1L;

        Account account = Account.builder().status(AccountStatus.INACTIVE).build();
        ReflectionTestUtils.setField(account, "accountId", accountId);

        when(accountRepository.findAccountIdByEmail(email)).thenReturn(accountId);
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        // when
        passwordResetService.requestReset(email, clientIp);

        // then
        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("비밀번호 재설정 승인(confirm) 성공")
    void confirmReset_Success() {
        // given
        String rawToken = "raw-token-string"; // 해싱 전 원래 토큰을 알기 어렵지만, 어차피 내부 Hash 후 조회하므로 예외를 일으키지 않으면 됨.
        // `confirmReset` 내부에서 `hashToken`으로 변환하므로, `findByTokenHash`가 특정 토큰을 반환하도록 설정

        // Reflection을 통해 private 메서드를 우회하거나, given에 anyString() 사용 권장
        PasswordResetToken token = PasswordResetToken.builder()
                .accountId(1L)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        Account account = Account.builder().status(AccountStatus.ACTIVE).build();
        ReflectionTestUtils.setField(account, "accountId", 1L);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        when(passwordEncoder.encode("newPassword123!")).thenReturn("hashed-new-password");

        // when
        passwordResetService.confirmReset(rawToken, "newPassword123!");

        // then
        verify(accountRepository, times(1)).findById(1L);
        assertNotNull(token.getUsedAt()); // 토큰 사용 처리 확인
        verify(tokenRepository, times(1)).save(token);
    }

    @Test
    @DisplayName("비밀번호 재설정 승인 실패 - 만료된 토큰")
    void confirmReset_Fail_ExpiredToken() {
        // given
        String rawToken = "raw-token-string";

        PasswordResetToken token = PasswordResetToken.builder()
                .accountId(1L)
                .expiresAt(LocalDateTime.now().minusHours(1)) // 이미 만료됨
                .build();

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        // when & then
        assertThrows(BusinessException.class, () -> passwordResetService.confirmReset(rawToken, "newPassword123!"));
    }

    @Test
    @DisplayName("비밀번호 재설정 승인 실패 - 이미 사용된 토큰")
    void confirmReset_Fail_UsedToken() {
        // given
        String rawToken = "raw-token-string";

        PasswordResetToken token = PasswordResetToken.builder()
                .accountId(1L)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        token.markUsed(LocalDateTime.now()); // 이미 사용처리

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        // when & then
        assertThrows(BusinessException.class, () -> passwordResetService.confirmReset(rawToken, "newPassword123!"));
    }
}
