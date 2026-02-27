package com.teamlms.backend.domain.auth.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PasswordResetMailServiceTest {

    @InjectMocks
    private PasswordResetMailService passwordResetMailService;

    @Mock
    private JavaMailSender mailSender;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(passwordResetMailService, "linkTemplate",
                "http://localhost:3000/password-reset?token=%s");
        ReflectionTestUtils.setField(passwordResetMailService, "subject", "Password Reset");
        ReflectionTestUtils.setField(passwordResetMailService, "from", "no-reply@test.com");
    }

    @Test
    @DisplayName("비밀번호 재설정 이메일 전송 성공")
    void sendResetLink_Success() {
        // given
        String to = "user@test.com";
        String rawToken = "sample-token-123";

        // when
        passwordResetMailService.sendResetLink(to, rawToken);

        // then
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
