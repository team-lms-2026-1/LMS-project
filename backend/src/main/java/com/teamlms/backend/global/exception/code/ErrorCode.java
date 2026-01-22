package com.teamlms.backend.global.exception.code;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // =========================
    // Common
    // =========================
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "요청값이 올바르지 않습니다.", "error.validation"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다.", "error.unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "권한이 없습니다.", "error.forbidden"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "NOT_FOUND", "대상을 찾을 수 없습니다.", "error.notFound"),
    CONFLICT(HttpStatus.CONFLICT, "CONFLICT", "요청이 현재 상태와 충돌합니다.", "error.conflict"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "서버 오류가 발생했습니다.", "error.internal"),

    // =========================
    // Domain: Account
    // =========================
    ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, "ACCOUNT_INACTIVE", "비활성화된 계정입니다.", "account.inactive"),
    ACCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND", "계정을 찾을 수 없습니다.", "account.notFound"),
    AUTH_FAILED(HttpStatus.UNAUTHORIZED, "AUTH_FAILED", "아이디 또는 비밀번호가 올바르지 않습니다.", "auth.failed"),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, "DUPLICATE_LOGIN_ID", "이미 사용 중인 로그인 아이디입니다.", "account.loginId.duplicate"),
    INVALID_HEAD_PROFESSOR(HttpStatus.CONFLICT, "INVALID_HEAD_PROFESSOR", "담당 교수는 해당 학과 소속 교수만 지정할 수 있습니다.", "dept.headProfessor.invalid"),



    // =========================
    // Domain: Dept&Major
    // =========================
    DEPT_DEACTIVATE_NOT_ALLOWED(HttpStatus.CONFLICT, "DEPT_DEACTIVATE_NOT_ALLOWED", "연관 데이터가 존재하여 학과를 비활성화할 수 없습니다.", "dept.deactivate.notAllowed"),
    DEPT_NOT_FOUND(HttpStatus.NOT_FOUND, "DEPT_NOT_FOUND", "학과를 찾을 수 없습니다.", "dept.notFound"),
    DUPLICATE_MAJOR_CODE(HttpStatus.CONFLICT, "DUPLICATE_MAJOR_CODE", "이미 사용 중인 전공 코드입니다.", "major.code.duplicate"),
    DUPLICATE_MAJOR_NAME(HttpStatus.CONFLICT, "DUPLICATE_MAJOR_NAME", "이미 사용 중인 전공 이름입니다.", "major.name.duplicate"),
    MAJOR_NOT_FOUND(HttpStatus.NOT_FOUND, "MAJOR_NOT_FOUND", "전공을 찾을 수 없습니다..", "dept.notFound"),
    MAJOR_NOT_IN_DEPT(HttpStatus.CONFLICT, "MAJOR_NOT_IN_DEPT", "전공이 해당 학과 소속이 아닙니다.", "major.notInDept"),
    MAJOR_IN_USE(HttpStatus.CONFLICT, "MAJOR_IN_USE", "연관 데이터가 존재하여 전공을 삭제할 수 없습니다.", "major.inUse"),



    // =========================
    // Domain: Community Category (카테고리 공통 에러)
    // =========================
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "카테고리를 찾을 수 없습니다.", "category.notFound"),
    DUPLICATE_CATEGORY_NAME(HttpStatus.CONFLICT, "DUPLICATE_CATEGORY_NAME", "이미 사용 중인 카테고리 이름입니다.", "category.name.duplicate"),
    CATEGORY_DELETE_NOT_ALLOWED(HttpStatus.CONFLICT, "CATEGORY_DELETE_NOT_ALLOWED", "연관된 게시글이 존재하여 카테고리를 삭제할 수 없습니다.", "category.delete.notAllowed"),
   

    // =========================
    // Domain: Community (공통)
    // =========================
    NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "NOTICE_NOT_FOUND", "게시글을 찾을 수 없습니다.", "notice.notFound"),
    NOTICE_AUTHOR_NOT_FOUND(HttpStatus.NOT_FOUND, "NOTICE_AUTHOR_NOT_FOUND", "작성자 정보를 찾을 수 없습니다.", "notice.author.notFound"),
    NOTICE_NOT_CATEGORY(HttpStatus.NOT_FOUND, "NOTICE_NOT_CATEGORY", "카테고리가 존재하지 않습니다.", "notice.category.notFound"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "해당 자료가 없습니다.", "resource.notFound"),
    RESOURCE_AUTHOR_NOT_FOUND(HttpStatus.NOT_FOUND, "RESOURCE_AUTHOR_NOT_FOUND", "작성자 정보를 찾을 수 없습니다.", "resource.author.notFound"),
    RESOURCE_NOT_CATEGORY(HttpStatus.NOT_FOUND, "RESOURCE_NOT_CATEGORY", "카테고리가 존재하지 않습니다.", "resource.category.notFound"),

    

    // =========================
    // Global: File & S3 (★ 여기 추가됨!)
    // =========================
    FILE_UPLOAD_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_UPLOAD_ERROR", "파일 업로드 중 오류가 발생했습니다.", "error.fileUpload");

    
    private final HttpStatus httpStatus;
    private final String code;
    private final String defaultMessage;
    private final String messageKey;

    ErrorCode(HttpStatus httpStatus, String code, String defaultMessage, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.messageKey = messageKey;
    } 
}
