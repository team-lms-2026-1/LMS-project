package com.teamlms.backend.global.exception;

public class AccountNotFoundException extends BusinessException {
    public AccountNotFoundException(String loginId) {
        super(ErrorCode.ACCOUNT_NOT_FOUND, loginId);
    }

    public AccountNotFoundException(Long accountId) {
        super(ErrorCode.ACCOUNT_NOT_FOUND, accountId);
    }
}
