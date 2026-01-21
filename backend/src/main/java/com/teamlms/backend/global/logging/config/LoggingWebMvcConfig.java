package com.teamlms.backend.global.logging.config;

import com.teamlms.backend.global.logging.interceptor.AccountAccessLogInterceptor;
import com.teamlms.backend.global.logging.interceptor.UserActivityInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 로그 관련 Interceptor들을 Spring MVC에 등록하는 설정 클래스
 *
 * - UserActivityInterceptor : 인증된 요청마다 사용자 활동 스냅샷 갱신
 * - AccountAccessLogInterceptor : 정책 대상 요청만 접근 로그 기록
 *
 * ❗ Interceptor는 자동 등록되지 않으므로 반드시 이 설정이 필요함
 */
@Configuration
@RequiredArgsConstructor
public class LoggingWebMvcConfig implements WebMvcConfigurer {

    private final UserActivityInterceptor userActivityInterceptor;
    private final AccountAccessLogInterceptor accountAccessLogInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        // 사용자 활동 스냅샷 (거의 모든 API 요청)
        registry.addInterceptor(userActivityInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/v1/auth/login",
                        "/api/v1/auth/logout",
                        "/error"
                );

        // 접근 로그 (정책 대상 요청만 내부에서 판단)
        registry.addInterceptor(accountAccessLogInterceptor)
                .addPathPatterns("/api/**");
    }
}
