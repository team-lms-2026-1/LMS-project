package com.teamlms.backend.domain.auth.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.auth.entity.PasswordResetToken;
import com.teamlms.backend.domain.auth.repository.PasswordResetTokenRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final AccountRepository accountRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordResetMailService mailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.token-ttl-seconds:1800}")
    private long tokenTtlSeconds;

    @Transactional
    public void requestReset(String email, String clientIp) {
        Long accountId = accountRepository.findAccountIdByEmail(email);
        if (accountId == null) return;

        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) return;
        if (account.getStatus() != AccountStatus.ACTIVE) return;

        LocalDateTime now = LocalDateTime.now();
        tokenRepository.markAllUnusedAsUsed(accountId, now);

        String rawToken = generateToken();
        String tokenHash = hashToken(rawToken);

        PasswordResetToken token = PasswordResetToken.builder()
                .accountId(accountId)
                .tokenHash(tokenHash)
                .expiresAt(now.plusSeconds(tokenTtlSeconds))
                .createdAt(now)
                .createdIp(clientIp)
                .build();

        tokenRepository.save(token);
        mailService.sendResetLink(email, rawToken);
    }

    @Transactional
    public void confirmReset(String rawToken, String newPassword) {
        String tokenHash = hashToken(rawToken);

        PasswordResetToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException(ErrorCode.PASSWORD_RESET_TOKEN_INVALID));

        LocalDateTime now = LocalDateTime.now();
        if (token.getUsedAt() != null) {
            throw new BusinessException(ErrorCode.PASSWORD_RESET_TOKEN_INVALID);
        }
        if (token.getExpiresAt().isBefore(now)) {
            throw new BusinessException(ErrorCode.PASSWORD_RESET_TOKEN_EXPIRED);
        }

        Account account = accountRepository.findById(token.getAccountId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
        }

        account.updatePassword(passwordEncoder.encode(newPassword), now);
        token.markUsed(now);
        tokenRepository.save(token);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
    }
}
