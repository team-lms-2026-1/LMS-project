package com.teamlms.backend.global.exception;

public class DeptNotFoundException extends RuntimeException {
    public DeptNotFoundException(Long deptId) {
        super("학과를 찾을 수 없습니다. deptId=" + deptId);
    }
}
