package com.teamlms.backend.global.logging.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * HttpServletRequest에서 로그에 필요한 정보를
 * 일관된 방식으로 추출하기 위한 유틸 클래스
 *
 * - IP (프록시 환경 고려)
 * - User-Agent
 * - Request Path / QueryString
 *
 * ❗ Interceptor / Service 어디서든 재사용
 */
public final class RequestInfoExtractor {

    private RequestInfoExtractor() {
    }

    /**
     * 클라이언트 IP 추출 (X-Forwarded-For 고려)
     */
    public static String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * User-Agent 추출
     */
    public static String getUserAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    /**
     * 요청 URI 추출
     */
    public static String getRequestPath(HttpServletRequest request) {
        return request.getRequestURI();
    }

    /**
     * Query String 추출 (? 이후)
     */
    public static String getQueryString(HttpServletRequest request) {
        return request.getQueryString();
    }
}
