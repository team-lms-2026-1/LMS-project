package com.teamlms.backend.global.exception;

public class DeptDeactivateNotAllowedException extends RuntimeException {
    public DeptDeactivateNotAllowedException(Long deptId) {
        super("연관 데이터가 존재하여 학과를 비활성화할 수 없습니다. deptId=" + deptId);
    }
}
