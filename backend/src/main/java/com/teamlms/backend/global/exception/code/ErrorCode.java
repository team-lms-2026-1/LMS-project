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
    INVALID_HEAD_PROFESSOR(HttpStatus.CONFLICT, "INVALID_HEAD_PROFESSOR", "담당 교수는 해당 학과 소속 교수만 지정할 수 있습니다.",
            "dept.headProfessor.invalid"),
    INVALID_PROFESSOR_ACCOUNT(HttpStatus.CONFLICT, "INVALID_HEAD_PROFESSOR", "유효하지않은 교수아이디입니다.",
            "dept.headProfessor.invalid"),
    PROFESSOR_PROFILE_NOT_FOUND(HttpStatus.CONFLICT, "INVALID_HEAD_PROFESSOR", "유효하지않은 교수아이디를 찾을 수 없습니다.",
            "dept.headProfessor.invalid"),
    STUDENT_PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND, "STUDENT_PROFILE_NOT_FOUND", "학생 계정을 찾을 수 없습니다.",
            "student.account.notFound"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "접근 권한이 없습니다.", "account.accessDenied"),

    // =========================
    // Domain: Dept&Major
    // =========================
    DEPT_DEACTIVATE_NOT_ALLOWED(HttpStatus.CONFLICT, "DEPT_DEACTIVATE_NOT_ALLOWED", "연관 데이터가 존재하여 학과를 비활성화할 수 없습니다.",
            "dept.deactivate.notAllowed"),
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
    DUPLICATE_CATEGORY_NAME(HttpStatus.CONFLICT, "DUPLICATE_CATEGORY_NAME", "이미 사용 중인 카테고리 이름입니다.",
            "category.name.duplicate"),
    CATEGORY_DELETE_NOT_ALLOWED(HttpStatus.CONFLICT, "CATEGORY_DELETE_NOT_ALLOWED", "연관된 게시글이 존재하여 카테고리를 삭제할 수 없습니다.",
            "category.delete.notAllowed"),

    // =========================
    // Domain: Community (공통)
    // =========================
    NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "NOTICE_NOT_FOUND", "게시글을 찾을 수 없습니다.", "notice.notFound"),
    NOTICE_AUTHOR_NOT_FOUND(HttpStatus.NOT_FOUND, "NOTICE_AUTHOR_NOT_FOUND", "작성자 정보를 찾을 수 없습니다.",
            "notice.author.notFound"),
    NOTICE_NOT_CATEGORY(HttpStatus.NOT_FOUND, "NOTICE_NOT_CATEGORY", "카테고리가 존재하지 않습니다.", "notice.category.notFound"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "해당 자료가 없습니다.", "resource.notFound"),
    RESOURCE_AUTHOR_NOT_FOUND(HttpStatus.NOT_FOUND, "RESOURCE_AUTHOR_NOT_FOUND", "작성자 정보를 찾을 수 없습니다.",
            "resource.author.notFound"),
    RESOURCE_NOT_CATEGORY(HttpStatus.NOT_FOUND, "RESOURCE_NOT_CATEGORY", "카테고리가 존재하지 않습니다.",
            "resource.category.notFound"),
    ENROLLMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "ENROLLMENT_NOT_FOUND", "수강 신청 내역이 존재하지 않습니다.", "enrollment.notFound"),

    // =========================
    // Domain: Semester
    // =========================
    SEMESTER_ALREADY_EXISTS(HttpStatus.CONFLICT, "SEMESTER_ALREADY_EXISTS", "해당 연도와 학기의 학기가 이미 존재합니다.",
            "semester.alreadyExists"),
    SEMESTER_NOT_FOUND(HttpStatus.NOT_FOUND, "SEMESTER_NOT_FOUND", "학기를 찾을 수 없습니다.", "semester.notFound"),

    // =========================
    // Domain: Curricular
    // =========================
    CURRICULAR_CODE_ALREADY_EXISTS(HttpStatus.CONFLICT, "CURRICULAR_CODE_ALREADY_EXISTS", "이미 사용 중인 교과목 코드입니다.",
            "curricular.code.alreadyExists"),
    CURRICULAR_NOT_FOUND(HttpStatus.NOT_FOUND, "CURRICULAR_NOT_FOUND", "교과목을 찾을 수 없습니다.", "curricular.notFound"),
    CURRICULAR_OFFERING_CODE_ALREADY_EXISTS(HttpStatus.CONFLICT, "CURRICULAR_OFFERING_CODE_ALREADY_EXISTS",
            "이미 사용 중인 개설코드입니다.", "curricular.offering.code.alreadyExists"),
    CURRICULAR_OFFERING_NOT_FOUND(HttpStatus.NOT_FOUND, "CURRICULAR_OFFERING_NOT_FOUND", "해당 교과운영을 찾을 수 없습니다.",
            "curricular.offering.notFound"),
    OFFERING_NOT_EDITABLE(HttpStatus.CONFLICT, "OFFERING_NOT_EDITABLE", "Draft가 아닌 운영교과입니다.",
            "curricular.offering.notEditable"),
    INVALID_OFFERING_STATUS_TRANSITION(HttpStatus.BAD_REQUEST, "INVALID_OFFERING_STATUS_TRANSITION", "올바르지 않은 상태변경입니다.",
            "error.validation"),
    GRADE_NOT_INPUTTED(HttpStatus.BAD_REQUEST, "GRADE_NOT_INPUTTED", "입력되지 않은 성적이있습니다.", "error.validation"),
    OFFERING_COMPETENCY_MAPPING_INCOMPLETE(HttpStatus.NOT_FOUND, "OFFERING_COMPETENCY_MAPPING_INCOMPLETE",
            "역량 매핑이 완료되지 않았습니다.", "offering.competency.mapping.incomplete"),
    OFFERING_NOT_ENROLLABLE(HttpStatus.BAD_REQUEST, "OFFERING_NOT_ENROLLABLE", "현재 상태에서는 수강 신청이 불가능한 교과입니다.",
            "offering.not.enrollable"),
    ENROLLMENT_ALREADY_EXISTS(HttpStatus.CONFLICT, "ENROLLMENT_ALREADY_EXISTS", "이미 수강 신청된 교과입니다.",
            "enrollment.already.exists"),
    OFFERING_CAPACITY_FULL(HttpStatus.CONFLICT, "OFFERING_CAPACITY_FULL", "수강 정원이 초과되었습니다.", "offering.capacity.full"),
    OFFERING_COMPETENCY_MAPPING_NOT_EDITABLE(HttpStatus.CONFLICT, "OFFERING_COMPETENCY_MAPPING_NOT_EDITABLE",
            "완료된 교과 운영의 역량 맵핑은 수정할 수 없습니다.", "offering.competency.mapping.notEditable"),
    OFFERING_COMPETENCY_WEIGHT_DUPLICATED(HttpStatus.CONFLICT, "OFFERING_COMPETENCY_WEIGHT_DUPLICATED",
            "중복된 역량 맵핑 점수가 있습니다.", "offering.competency.weight.duplicated"),
    CURRICULAR_OFFERING_ALREADY_EXISTS(HttpStatus.CONFLICT, "CURRICULAR_OFFERING_ALREADY_EXISTS",
            "이미 해당 학기에 개설된 교과입니다.", "curricular.offering.already.exists"),

    OFFERING_NOT_GRADEABLE_STATUS(HttpStatus.CONFLICT, "OFFERING_NOT_GRADEABLE_STATUS", "점수입력 상태가 아닙니다.",
            "offering.gradeinput.mismatch"),
    ENROLLMENT_OFFERING_MISMATCH(HttpStatus.CONFLICT, "ENROLLMENT_OFFERING_MISMATCH", "해당 수강정보는 요청한 교과 운영에 속하지 않습니다.",
            "enrollment.offering.mismatch"),
    ENROLLMENT_NOT_GRADEABLE(HttpStatus.CONFLICT, "ENROLLMENT_NOT_GRADEABLE", "취소된 수강 정보에는 성적을 입력할 수 없습니다.",
            "enrollment.not.gradeable"),
    GRADE_ALREADY_CONFIRMED(HttpStatus.CONFLICT, "GRADE_ALREADY_CONFIRMED", "이미 성적이 확정된 수강 정보는 수정할 수 없습니다.",
            "grade.already.confirmed"),
    CURRICULAR_OFFERING_STATUS_LOCKED(HttpStatus.CONFLICT, "CURRICULAR_OFFERING_STATUS_LOCKED",
            "이미 완료된 교과운영은 상태를 변경할 수 없습니다.", "curricular.offering.status.locked"),
    ENROLLMENT_CANCEL_NOT_ALLOWED_STATUS(HttpStatus.FORBIDDEN, "ENROLLMENT_CANCEL_NOT_ALLOWED_STATUS",
            "현재 교과 운영 상태에서는 수강 신청을 취소할 수 없습니다.", "enrollment.cancel.notAllowedStatus"),
    // =========================
    // Domain: ExtraCurricular
    // =========================
    EXTRA_CURRICULAR_CODE_ALREADY_EXISTS(HttpStatus.CONFLICT, "EXTRA_CURRICULAR_CODE_ALREADY_EXISTS",
            "이미 사용 중인 비교과목 코드입니다.", "extra.curricular.code.alreadyExists"),
    EXTRA_CURRICULAR_NOT_FOUND(HttpStatus.NOT_FOUND, "EXTRA_CURRICULAR_NOT_FOUND", "비교과목을 찾을 수 없습니다.",
            "extra.curricular.notFound"),
    // =========================
    // Domain: Competency
    // =========================
    COMPETENCY_NOT_FOUND(HttpStatus.NOT_FOUND, "COMPETENCY_NOT_FOUND", "역량 정보가 존재하지 않습니다.", "competency.notFound"),

    // =========================
    // Global: File & S3 (★ 여기 추가됨!)
    // =========================
    FILE_UPLOAD_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_UPLOAD_ERROR", "파일 업로드 중 오류가 발생했습니다.",
            "error.fileUpload"),

    // =========================
    // Domain: study_rental
    // =========================
    STUDY_RENTAL_NOT_TIME(HttpStatus.CONFLICT, "STUDY_RENTAL_NOT_TIME", "해당 시간에는 예약 할 수 없습니다.",
            "study.rental.not.time"),
    STUDY_RENTAL_NOT_ST_TIME(HttpStatus.CONFLICT, "STUDY_RENTAL_NOT_ST_TIME", "종료 시간이 시작 시간보다 빠를 수 없습니다.",
            "study.rental.not.st.time"),
    STUDY_RENTAL_NOT_FOUND(HttpStatus.NOT_FOUND, "STUDY_RENTAL_NOT_FOUND", "예약을 찾지 못했습니다.", "study.rental.not.found"),
    STUDY_RENTAL_NOT_FOUND_A(HttpStatus.NOT_FOUND, "STUDY_RENTAL_NOT_FOUND_A", "학습공간을 찾지 못했습니다.",
            "study.rental.not.found_a"),
    STUDY_RENTAL_NOT_UPDATE(HttpStatus.CONFLICT, "STUDY_RENTAL_NOT_UPDATE", "업데이트를 하지 못했습니다.",
            "study.rental.not.update"),
    STUDY_RENTAL_NOT_DELETE(HttpStatus.NOT_FOUND, "STUDY_RENTAL_NOT_DELETE", "삭제를 하지 못했습니다.",
            "study.rental.not.delete"),
    STUDY_RENTAL_NOT_CREATE(HttpStatus.CONFLICT, "STUDY_RENTAL_NOT_CREATE", "생성을 하지 못했습니다.", "study.rental.not.create"),
    STUDY_RENTAL_MIN_MAX(HttpStatus.CONFLICT, "STUDY_RENTAL_MIN_MAX", "최대 인원은 최소 인원보다 커야 합니다.", "study.rent.min.max"),
    STUDY_RENTAL_USER_NOT_FOUND(HttpStatus.NOT_FOUND, "STUDY_RENTAL_USER_NOT_FOUND", "사용자를 찾지 못했습니다.", "user.notFound"),

    // =========================
    // Domain: survey
    // =========================
    SURVEY_NOT_FOUND(HttpStatus.NOT_FOUND, "SURVEY_NOT_FOUND", "설문 정보를 찾을 수 없습니다.", "survey.notFound"),
    SURVEY_NOT_TARGET(HttpStatus.FORBIDDEN, "SURVEY_NOT_TARGET", "해당 설문의 대상자가 아닙니다.", "survey.notTarget"),
    SURVEY_ALREADY_SUBMITTED(HttpStatus.CONFLICT, "SURVEY_ALREADY_SUBMITTED", "이미 응답을 제출한 설문입니다.",
            "survey.alreadySubmitted"),
    SURVEY_NOT_OPEN(HttpStatus.BAD_REQUEST, "SURVEY_NOT_OPEN", "현재 진행 중인 설문이 아닙니다.", "survey.notOpen"),

    // =========================
    // Domain: Mentoring
    // =========================
    MENTORING_RECRUITMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "MENTORING_RECRUITMENT_NOT_FOUND", "멘토링 모집 공고를 찾을 수 없습니다.",
            "mentoring.recruitment.notFound"),
    MENTORING_APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "MENTORING_APPLICATION_NOT_FOUND", "멘토링 신청 정보를 찾을 수 없습니다.",
            "mentoring.application.notFound"),
    MENTORING_MATCHING_NOT_FOUND(HttpStatus.NOT_FOUND, "MENTORING_MATCHING_NOT_FOUND", "멘토링 매칭 정보를 찾을 수 없습니다.",
            "mentoring.matching.notFound"),
    MENTORING_QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "MENTORING_QUESTION_NOT_FOUND", "멘토링 질문을 찾을 수 없습니다.",
            "mentoring.question.notFound"),
    MENTORING_NOT_MENTOR(HttpStatus.FORBIDDEN, "MENTORING_NOT_MENTOR", "해당 멘토링의 멘토가 아닙니다.", "mentoring.notMentor"),
    MENTORING_NOT_MENTEE(HttpStatus.FORBIDDEN, "MENTORING_NOT_MENTEE", "해당 멘토링의 멘티가 아닙니다.", "mentoring.notMentee"),
    MENTORING_INVALID_ROLE_APPLICATION(HttpStatus.BAD_REQUEST, "MENTORING_INVALID_ROLE_APPLICATION",
            "해당 역할로 신청할 수 없는 계정입니다.", "mentoring.application.invalidRole"),
    MENTORING_APPLICATION_ALREADY_EXISTS(HttpStatus.CONFLICT, "MENTORING_APPLICATION_ALREADY_EXISTS",
            "이미 해당 공고에 신청하셨습니다.", "mentoring.application.alreadyExists"),
    MENTORING_NOT_PARTICIPANT(HttpStatus.FORBIDDEN, "MENTORING_NOT_PARTICIPANT", "해당 멘토링의 참여자가 아닙니다.", "mentoring.notParticipant"),
    MENTORING_ALREADY_MATCHED(HttpStatus.CONFLICT, "MENTORING_ALREADY_MATCHED", "이미 매칭된 신청자입니다.", "mentoring.alreadyMatched"),
    // Domain: competency
    // =========================
    DUPLICATE_DIAGNOSIS_FOR_SEMESTER(HttpStatus.CONFLICT, "DUPLICATE_DIAGNOSIS_FOR_SEMESTER", "이미 해당 학기에 진단이 존재합니다.",
            "diagnosis.duplicate"),
    CANNOT_DELETE_DIAGNOSIS_WITH_SUBMISSIONS(HttpStatus.CONFLICT, "CANNOT_DELETE_DIAGNOSIS_WITH_SUBMISSIONS",
            "이미 응답이 제출된 진단은 삭제할 수 없습니다.", "diagnosis.delete.conflict"),
    CANNOT_MODIFY_CLOSED_DIAGNOSIS(HttpStatus.CONFLICT, "CANNOT_MODIFY_CLOSED_DIAGNOSIS", "종료된 진단은 수정할 수 없습니다.",
            "diagnosis.modify.closed"),
    INVALID_DATE_RANGE(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", "시작일이 종료일보다 빠를 수 없습니다.", "diagnosis.date.invalid"),
    NO_RESPONSE_DATA(HttpStatus.NOT_FOUND, "NO_RESPONSE_DATA", "응답 데이터가 없습니다.", "diagnosis.response.empty"),
    DIAGNOSIS_NOT_OPEN(HttpStatus.BAD_REQUEST, "DIAGNOSIS_NOT_OPEN", "현재 진행 중인 진단이 아닙니다.", "diagnosis.notOpen"),
    DIAGNOSIS_NOT_FOUND(HttpStatus.NOT_FOUND, "DIAGNOSIS_NOT_FOUND", "진단을 찾을 수 없습니다.", "diagnosis.notFound"),
    CANNOT_MODIFY_QUESTIONS_AFTER_OPEN(HttpStatus.BAD_REQUEST, "CANNOT_MODIFY_QUESTIONS_AFTER_OPEN",
            "진단이 시작된 후는 문항을 수정할 수 없습니다.", "diagnosis.modify.questions.afterOpen"),
    ALREADY_SUBMITTED_DIAGNOSIS(HttpStatus.CONFLICT, "ALREADY_SUBMITTED_DIAGNOSIS", "이미 제출한 진단입니다.",
            "diagnosis.alreadySubmitted"),
    INVALID_COMPETENCY_WEIGHT(HttpStatus.BAD_REQUEST, "INVALID_COMPETENCY_WEIGHT", "역량 가중치는 0에서 6 사이여야 합니다.",
            "competency.weight.invalid");

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
