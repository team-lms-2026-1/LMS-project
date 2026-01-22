package com.teamlms.backend.global.error;

import com.teamlms.backend.global.api.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleBiz(BizException e) {
        return new ApiResponse<>(
                Map.of("code", e.getCode(), "message", e.getMessage()),
                Map.of()
        );
    }
}
