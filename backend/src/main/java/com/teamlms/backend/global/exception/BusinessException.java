package com.teamlms.backend.global.exception;

public abstract class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Object[] args;

    protected BusinessException(ErrorCode errorCode, Object... args) {
        this.errorCode = errorCode;
        this.args = args;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public Object[] getArgs() {
        return args;
    }
}
