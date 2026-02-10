package com.teamlms.backend.global.exception;

import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.exception.dto.ErrorResponse;
import com.teamlms.backend.global.exception.dto.FieldErrorItem;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Locale;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource; // i18n (없으면 주입 실패) -> Config 포함 권장

    
    /**
     * Bean Validation (@Valid) 실패
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        
        ErrorCode ec = ErrorCode.VALIDATION_ERROR;

        List<FieldErrorItem> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toFieldErrorItem)
                .toList();

        String message = resolveMessage(ec, null, LocaleContextHolder.getLocaleSafely());
        return ResponseEntity.status(ec.getHttpStatus())
                .body(ErrorResponse.of(ec.getCode(), message, fieldErrors));
    }

    /**
     * JSON 파싱 실패 / 타입 미스매치 등
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex) {
        ErrorCode ec = ErrorCode.VALIDATION_ERROR;
        String message = resolveMessage(ec, null, LocaleContextHolder.getLocaleSafely());
        return ResponseEntity.status(ec.getHttpStatus())
                .body(ErrorResponse.of(ec.getCode(), message));
    }

    /**
     * 비즈니스 예외 (도메인 규칙 위반 포함)
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        ErrorCode ec = ex.getErrorCode();
        String message = resolveMessage(ec, ex.getArgs(), LocaleContextHolder.getLocaleSafely());
        return ResponseEntity.status(ec.getHttpStatus())
                .body(ErrorResponse.of(ec.getCode(), message));
    }

    /**
     * Spring Security - 인가 실패
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        ErrorCode ec = ErrorCode.FORBIDDEN;
        String message = resolveMessage(ec, null, LocaleContextHolder.getLocaleSafely());
        return ResponseEntity.status(ec.getHttpStatus())
                .body(ErrorResponse.of(ec.getCode(), message));
    }

    /**
     * Spring Security - 인증 실패
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuth(AuthenticationException ex) {
        ErrorCode ec = ErrorCode.UNAUTHORIZED;
        String message = resolveMessage(ec, null, LocaleContextHolder.getLocaleSafely());
        return ResponseEntity.status(ec.getHttpStatus())
                .body(ErrorResponse.of(ec.getCode(), message));
    }

    /**
     * 나머지 예외 (절대 상세 메시지 그대로 노출 X)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest req) {

        // ✅ 추가: 스택트레이스 로깅
        log.error("[UNEXPECTED] {} {} | query={} | ua={}",
                req.getMethod(),
                req.getRequestURI(),
                req.getQueryString(),
                req.getHeader("User-Agent"),
                ex);

        ErrorCode ec = ErrorCode.INTERNAL_ERROR;
        String message = resolveMessage(ec, null, LocaleContextHolder.getLocaleSafely());
        return ResponseEntity.status(ec.getHttpStatus())
                .body(ErrorResponse.of(ec.getCode(), message));
    }

    private FieldErrorItem toFieldErrorItem(FieldError fe) {
        // fe.getDefaultMessage()는 @NotBlank(message="...") 등이 들어올 수 있음
        String reason = fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid";
        return FieldErrorItem.of(fe.getField(), reason);
    }

    private String resolveMessage(ErrorCode ec, Object[] args, Locale locale) {
        try {
            return messageSource.getMessage(ec.getMessageKey(), args, ec.getDefaultMessage(), locale);
        } catch (Exception ignore) {
            return ec.getDefaultMessage();
        }
    }

    /**
     * LocaleResolver(accept-language) 기반 locale을 안전하게 가져오고 싶을 때 사용
     * (테스트/특수 상황 대비)
     */
    static class LocaleContextHolder {
        static Locale getLocaleSafely() {
            try {
                // 스프링의 LocaleContextHolder를 직접 import해서 써도 됨
                return org.springframework.context.i18n.LocaleContextHolder.getLocale();
            } catch (Exception ignore) {
                return Locale.KOREAN;
            }
        }
    }
}
