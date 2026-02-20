package com.teamlms.backend.global.audit;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.teamlms.backend.global.security.principal.AuthUser;

import java.util.Optional;

public class CurrentAuditorAware implements AuditorAware<Long> {

    // 운영정책: 로그인 정보 없을 때는 SYSTEM(0)로 기록
    public static final long SYSTEM_AUDITOR_ID = 0L;

    @Override
    public Optional<Long> getCurrentAuditor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return Optional.of(SYSTEM_AUDITOR_ID);
        }
        if ("anonymousUser".equals(auth.getPrincipal())) {
            return Optional.of(SYSTEM_AUDITOR_ID);
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof AuthUser u) {
            return Optional.of(u.getAccountId());
        }

        if (principal instanceof Long accountId) {
            return Optional.of(accountId);
        }

        // 그 외는 SYSTEM 처리
        return Optional.of(SYSTEM_AUDITOR_ID);
    }
}
