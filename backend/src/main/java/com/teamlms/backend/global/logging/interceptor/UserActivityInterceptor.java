package com.teamlms.backend.global.logging.interceptor;

import com.teamlms.backend.domain.log.service.LogCommandService;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 인증된 사용자의 "최근 활동 정보(user_activity)"를 갱신하는 인터셉터
 *
 * - 목적: 온라인 여부 판단, 관리자 목록 화면용 스냅샷 유지
 * - 특징: 계정당 1행, upsert 방식
 * - 저장 시점: 요청 처리 완료 후(afterCompletion)
 *
 * ❗ 접근 이력(account_access_log)과는 역할이 다름
 */
@Component
@RequiredArgsConstructor
public class UserActivityInterceptor implements HandlerInterceptor {

    private final LogCommandService logCommandService;

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser authUser)) {
            return; // 비인증 요청은 활동 기록 대상 아님
        }

        Long accountId = authUser.getAccountId();

        // 실제 upsert 로직은 LogCommandService에 위임
        logCommandService.upsertUserActivity(accountId, request);
    }
}
