package com.teamlms.backend.global.exception;

public class MajorNotFoundException extends RuntimeException {
    public MajorNotFoundException(Long majorId) {
        super("전공을 찾을 수 없습니다. majorId=" + majorId);
    }
}
