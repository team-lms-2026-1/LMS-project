package com.teamlms.backend.global.exception.base;

import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Object[] args;

    /**
     * i18n args가 필요 없으면 args는 null로 둬도 됨.
     */
    public BusinessException(ErrorCode errorCode, Object... args) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.args = args;
    }
}
