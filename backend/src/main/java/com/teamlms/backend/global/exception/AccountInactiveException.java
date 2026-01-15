package com.teamlms.backend.global.exception;

public class AccountInactiveException extends BusinessException {
    public AccountInactiveException(Long accountId) {
        super(ErrorCode.ACCOUNT_INACTIVE, accountId);
    }
}

