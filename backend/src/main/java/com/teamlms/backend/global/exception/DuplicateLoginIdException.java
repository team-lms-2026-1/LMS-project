package com.teamlms.backend.global.exception;

public class DuplicateLoginIdException extends RuntimeException {
    public DuplicateLoginIdException(String loginId) {
        super("이미 사용 중인 loginId 입니다: " + loginId);
    }
}
