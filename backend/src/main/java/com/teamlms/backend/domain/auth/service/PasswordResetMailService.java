package com.teamlms.backend.domain.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordResetMailService {

    private final JavaMailSender mailSender;

    @Value("${app.password-reset.link-template:http://localhost:3000/password-reset?token=%s}")
    private String linkTemplate;

    @Value("${app.password-reset.mail-subject:Password Reset}")
    private String subject;

    @Value("${app.password-reset.mail-from:no-reply@teamlms.local}")
    private String from;

    public void sendResetLink(String to, String rawToken) {
        String link = String.format(linkTemplate, rawToken);

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText("비밀번호 재설정 링크입니다.\n\n" + link + "\n\n만료 시간이 지나면 다시 요청해주세요.");
        if (from != null && !from.isBlank()) {
            msg.setFrom(from);
        }

        mailSender.send(msg);
    }
}
