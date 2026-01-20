package com.teamlms.backend.global.exception;

public class InvalidHeadProfessorException extends RuntimeException {

    public InvalidHeadProfessorException(Long headProfessorAccountId, Long deptId) {
        super(
            "담당 교수는 해당 학과 소속 교수만 지정할 수 있습니다. "
            + "deptId=" + deptId
            + ", headProfessorAccountId=" + headProfessorAccountId
        );
    }
}
