package com.teamlms.backend.global.i18n;

import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Locale;

/**
 * Locale 관련 유틸리티
 */
public class LocaleUtil {

    private static final String DEFAULT_LOCALE = "ko";

    /**
     * 현재 요청의 Locale 코드 (2자리) 반환
     * Accept-Language 헤더 또는 쿼리 파라미터에서 추출
     * @return locale code (ko, en, ja 등)
     */
    public static String getCurrentLocale() {
        try {
            Locale locale = LocaleContextHolder.getLocale();
            if (locale != null) {
                String language = locale.getLanguage();
                // 지원하는 언어만 반환
                if (isSupportedLanguage(language)) {
                    return language;
                }
            }
        } catch (Exception e) {
            // LocaleContextHolder에서 locale을 못 찾은 경우
        }

        return DEFAULT_LOCALE;
    }

    /**
     * 특정 Locale 코드가 지원되는지 확인
     * @param language language code (ko, en, ja 등)
     * @return 지원 여부
     */
    public static boolean isSupportedLanguage(String language) {
        return language != null && (
            language.equals("ko") ||
            language.equals("en") ||
            language.equals("ja")
        );
    }

    /**
     * Locale 코드를 Java Locale 객체로 변환
     * @param localeCode locale code (ko, en, ja 등)
     * @return Locale object
     */
    public static Locale toLocale(String localeCode) {
        return switch (localeCode) {
            case "en" -> Locale.ENGLISH;
            case "ja" -> Locale.JAPAN;
            case "ko" -> Locale.KOREAN;
            default -> Locale.KOREAN;
        };
    }

    /**
     * Locale 코드를 정규화 (대문자 제거, 언어만 추출)
     * @param localeCode locale code
     * @return normalized locale code
     */
    public static String normalize(String localeCode) {
        if (localeCode == null) {
            return DEFAULT_LOCALE;
        }

        String normalized = localeCode.toLowerCase();
        // "en-US" -> "en", "en_US" -> "en"
        if (normalized.contains("-")) {
            normalized = normalized.split("-")[0];
        } else if (normalized.contains("_")) {
            normalized = normalized.split("_")[0];
        }

        if (isSupportedLanguage(normalized)) {
            return normalized;
        }

        return DEFAULT_LOCALE;
    }
}
