package com.teamlms.backend.global.exception;

public enum ErrorCode {

    AUTH_FAILED("AUTH_000"),
    ACCOUNT_NOT_FOUND("AUTH_001"),
    ACCOUNT_INACTIVE("AUTH_002"),

    DEPT_DEACTIVATE_NOT_ALLOWED("DEPT_001");
    
    private final String code;

    ErrorCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
