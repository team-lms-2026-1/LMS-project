package com.teamlms.backend.global.exception.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class ErrorResponse {

    private final ErrorBody error;

    private ErrorResponse(ErrorBody error) {
        this.error = error;
    }

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(new ErrorBody(code, message, null));
    }

    public static ErrorResponse of(String code, String message, List<FieldErrorItem> fieldErrors) {
        return new ErrorResponse(new ErrorBody(code, message, fieldErrors));
    }

    @Getter
    public static class ErrorBody {
        private final String code;
        private final String message;
        private final List<FieldErrorItem> fieldErrors;

        public ErrorBody(String code, String message, List<FieldErrorItem> fieldErrors) {
            this.code = code;
            this.message = message;
            this.fieldErrors = fieldErrors;
        }
    }
}
