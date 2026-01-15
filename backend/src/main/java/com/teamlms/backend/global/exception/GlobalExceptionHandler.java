package com.teamlms.backend.global.exception;

import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.context.MessageSource;

import java.util.Locale;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    public GlobalExceptionHandler(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException e,
            Locale locale
    ) {
        String message = messageSource.getMessage(
                e.getErrorCode().getCode(),
                e.getArgs(),
                locale
        );

        return ResponseEntity
                .status(401) // 일단 인증 예외 기준
                .body(new ErrorResponse(
                        e.getErrorCode().getCode(),
                        message
                ));
    }
}
