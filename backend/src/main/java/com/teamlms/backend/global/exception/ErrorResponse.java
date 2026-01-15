package com.teamlms.backend.global.exception;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class ErrorResponse {

    private final String code;
    private final String message;

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message);
    }
}
