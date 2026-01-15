package com.teamlms.backend.global.exception;

public class AuthenticationFailedException extends BusinessException {
    public AuthenticationFailedException() {
        super(ErrorCode.AUTH_FAILED);
    }
}
