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
 * 접근 이력(account_access_log)을 append-only로 기록하는 인터셉터
 *
 * - 목적: 감사, 보안 사고 추적
 * - 특징: 모든 요청이 아닌 "정책 대상 요청만" 기록
 * - 저장 시점: 요청 완료 후(afterCompletion)
 *
 * ❗ shouldLog() 조건이 핵심 정책 포인트
 */
@Component
@RequiredArgsConstructor
public class AccountAccessLogInterceptor implements HandlerInterceptor {

    private final LogCommandService logCommandService;

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex
    ) {

        if (!shouldLog(request, response)) {
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser authUser)) {
            return;
        }

        Long accountId = authUser.getAccountId();

        // 실제 insert 로직은 LogCommandService에 위임
        logCommandService.saveAccountAccessLog(accountId, request, response);
    }

    /**
     * 어떤 요청을 접근 로그로 남길지 결정하는 정책 메서드
     *
     * 1차 정책(권장):
     * - 역할별 API(/admin, /student, /professor) 는 기록
     * - 헬스/에러/인증 같은 노이즈는 제외
     * - 필요하면 추후 "조회 GET 제외" 같은 룰을 더 추가
     */
    private boolean shouldLog(HttpServletRequest request, HttpServletResponse response) {
        String uri = request.getRequestURI();

        // 0) 노이즈/내부 엔드포인트 제외
        if (uri == null) return false;

        if (uri.startsWith("/error")
                || uri.startsWith("/actuator")
                || uri.startsWith("/health")
                || uri.startsWith("/ping")) {
            return false;
        }

        // 1) 인증 API 제외 (원하면 login/logout만 true로 따로 처리)
        if (uri.startsWith("/api/v1/auth")) {
            // 로그인/로그아웃까지 access_log로 남기고 싶으면 아래 두 줄을 살리고, 위 if를 조정해도 됨.
            // if (uri.equals("/api/v1/auth/login") || uri.equals("/api/v1/auth/logout")) return true;
            return false;
        }

        // 2) 역할별 API 기록
        boolean isRoleApi = uri.startsWith("/api/v1/admin")
                || uri.startsWith("/api/v1/student")
                || uri.startsWith("/api/v1/professor");

        if (!isRoleApi) return false;

        // 3) (선택) 정적/문서/파일 같은 것 제외하고 싶으면 여기서 추가

        return true;
    }

}
