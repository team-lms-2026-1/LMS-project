package com.teamlms.backend.domain.curricular.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.competency.repository.CompetencyRepository;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUpdateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingPatchRequest;
import com.teamlms.backend.domain.curricular.entity.CurricularOffering;
import com.teamlms.backend.domain.curricular.entity.CurricularOfferingCompetencyMap;
import com.teamlms.backend.domain.curricular.entity.CurricularOfferingCompetencyMapId;
import com.teamlms.backend.domain.curricular.entity.Enrollment;
import com.teamlms.backend.domain.curricular.enums.CompletionStatus;
import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;
import com.teamlms.backend.domain.curricular.enums.EnrollmentStatus;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularRepository;
import com.teamlms.backend.domain.curricular.repository.EnrollmentRepository;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CurricularOfferingCommandService {

    private final CurricularRepository curricularRepository;
    private final CurricularOfferingRepository curricularOfferingRepository;
    private final SemesterRepository semesterRepository;

    private final AccountRepository accountRepository;
    private final ProfessorProfileRepository professorProfileRepository;

    private final EnrollmentRepository enrollmentRepository;
    private final CurricularOfferingCompetencyMapRepository competencyMapRepository;
    private final CompetencyRepository competencyRepository;

    // =====================
    // 개설 생성
    // =====================
    public void create(
            String offeringCode,
            Long curricularId,
            Long semesterId,
            DayOfWeekType dayOfWeek,
            Integer period,
            Integer capacity,
            String location,
            Long professorAccountId
    ) {
        validateProfessor(professorAccountId);

        if (!curricularRepository.existsById(curricularId)) {
            throw new BusinessException(ErrorCode.CURRICULAR_NOT_FOUND, curricularId);
        }

        if (curricularOfferingRepository.existsByOfferingCode(offeringCode)) {
            throw new BusinessException(ErrorCode.CURRICULAR_OFFERING_CODE_ALREADY_EXISTS, offeringCode);
        }

        if (!semesterRepository.existsById(semesterId)) {
            throw new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, semesterId);
        }

        CurricularOffering offering = CurricularOffering.builder()
                .offeringCode(offeringCode)
                .curricularId(curricularId)
                .semesterId(semesterId)
                .dayOfWeek(dayOfWeek)
                .period(period)
                .capacity(capacity)
                .location(location)
                .professorAccountId(professorAccountId)
                .status(OfferingStatus.DRAFT)
                .build();

        curricularOfferingRepository.save(offering);
    }

    // =====================
    // 기본 수정 (DRAFT만)
    // =====================
    public void patchBasic(Long offeringId, CurricularOfferingUpdateRequest req) {

        CurricularOffering offering = curricularOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        if (offering.getStatus() != OfferingStatus.DRAFT) {
            throw new BusinessException(ErrorCode.OFFERING_NOT_EDITABLE, offeringId, offering.getStatus());
        }

        // offeringCode 수정(중복 방지)
        if (req.offeringCode() != null && !req.offeringCode().isBlank()) {
            String nextCode = req.offeringCode().trim();
            if (!nextCode.equals(offering.getOfferingCode())
                    && curricularOfferingRepository.existsByOfferingCode(nextCode)) {
                throw new BusinessException(ErrorCode.CURRICULAR_OFFERING_CODE_ALREADY_EXISTS, nextCode);
            }
        }

        // semesterId 수정(존재 검증)
        if (req.semesterId() != null) {
            if (!semesterRepository.existsById(req.semesterId())) {
                throw new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, req.semesterId());
            }
        }

        // 교수 변경 시 검증
        if (req.professorAccountId() != null) {
            validateProfessor(req.professorAccountId());
        }

        offering.patchForDraft(
                req.offeringCode(),
                req.semesterId(),
                req.dayOfWeek(),
                req.period(),
                req.capacity(),
                req.location(),
                req.professorAccountId()
        );
    }

    // =====================
    // 상태 변경
    // - OPEN → ENROLLMENT_CLOSED 자동 전환은 "수강신청 서비스"에서 처리 추천
    // - 여기서는 "수동 상태 변경" + COMPLETED 시 확정 로직 담당
    // =====================
    public void changeStatus(
            Long offeringId,
            OfferingStatus targetStatus,
            Long actorAccountId
    ) {
        CurricularOffering offering = curricularOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        OfferingStatus current = offering.getStatus();

        validateTransition(current, targetStatus);

        // 🔥 IN_PROGRESS -> COMPLETED 전환 시, 필수 체크 + 성적 확정
        if (current == OfferingStatus.IN_PROGRESS && targetStatus == OfferingStatus.COMPLETED) {
            validateCompetencyMappingCompleted(offeringId);
            confirmGrades(offeringId, actorAccountId);
        }

        offering.changeStatus(targetStatus);
    }

    // =====================
    // 상태 전이 검증
    // =====================
    private void validateTransition(OfferingStatus from, OfferingStatus to) {

        // ✅ 허용 전이
        if (from == OfferingStatus.DRAFT && to == OfferingStatus.OPEN) return;

        // OPEN 상태에서 정원 찼으면 ENROLLMENT_CLOSED로 자동 전환하는 편이 일반적이지만,
        // 수동 전환도 허용할지 여부는 정책 선택. (여기서는 허용)
        if (from == OfferingStatus.OPEN && to == OfferingStatus.ENROLLMENT_CLOSED) return;

        if (from == OfferingStatus.OPEN && to == OfferingStatus.IN_PROGRESS) return;
        if (from == OfferingStatus.ENROLLMENT_CLOSED && to == OfferingStatus.IN_PROGRESS) return;

        if (from == OfferingStatus.IN_PROGRESS && to == OfferingStatus.COMPLETED) return;

        // 언제든 취소는 허용
        if (to == OfferingStatus.CANCELED) return;

        throw new BusinessException(
                ErrorCode.INVALID_OFFERING_STATUS_TRANSITION,
                from, to
        );
    }

    // =====================
    // COMPLETED 전환 조건: 역량 매핑 6개(1~6) 완성 여부
    // =====================
    private void validateCompetencyMappingCompleted(Long offeringId) {

        long total = competencyMapRepository.countByIdOfferingId(offeringId);
        if (total != 6) {
            throw new BusinessException(
                    ErrorCode.OFFERING_COMPETENCY_MAPPING_INCOMPLETE,
                    offeringId
            );
        }

        long distinctWeights = competencyMapRepository.countDistinctWeight1to6(offeringId);
        if (distinctWeights != 6) {
            throw new BusinessException(
                    ErrorCode.OFFERING_COMPETENCY_MAPPING_INCOMPLETE,
                    offeringId
            );
        }
    }

    // =====================
    // COMPLETED 전환 조건: 성적 모두 입력 + 성적 확정(grade/완료상태)
    // =====================
    private void confirmGrades(Long offeringId, Long actorAccountId) {

        List<Enrollment> enrollments = enrollmentRepository.findByOfferingId(offeringId);

        for (Enrollment e : enrollments) {

            // ✅ 1) 취소자는 성적 확정 대상 아님
            if (e.getEnrollmentStatus() != EnrollmentStatus.ENROLLED) {
                continue;
            }

            // ✅ 2) 재호출 방지 (idempotent)
            if (Boolean.TRUE.equals(e.getIsGradeConfirmed())) {
                continue;
            }

            // ✅ 3) 점수 미입력은 예외
            if (e.getRawScore() == null) {
                throw new BusinessException(
                        ErrorCode.GRADE_NOT_INPUTTED,
                        e.getEnrollmentId()
                );
            }

            String grade = GradeCalculator.fromScore(e.getRawScore());
            CompletionStatus completionStatus =
                    GradeCalculator.isPassed(grade) ? CompletionStatus.PASSED : CompletionStatus.FAILED;

            e.confirmGrade(
                    grade,
                    completionStatus,
                    actorAccountId,
                    LocalDateTime.now()
            );
        }
    }


    // =====================
    // 교수 검증 공통
    // =====================
    private void validateProfessor(Long professorAccountId) {

        Account acc = accountRepository.findById(professorAccountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, professorAccountId));

        if (acc.getAccountType() != AccountType.PROFESSOR) {
            throw new BusinessException(ErrorCode.INVALID_PROFESSOR_ACCOUNT, professorAccountId);
        }

        if (!professorProfileRepository.existsById(professorAccountId)) {
            throw new BusinessException(ErrorCode.PROFESSOR_PROFILE_NOT_FOUND, professorAccountId);
        }
    }

    // 역량 맵핑
    public void patchMapping(Long offeringId, OfferingCompetencyMappingPatchRequest req) {
        
        // offering 존재
        CurricularOffering offering = curricularOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        // offering status 가 완료면 수정불가
        if (offering.getStatus() == OfferingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.OFFERING_COMPETENCY_MAPPING_NOT_EDITABLE, offeringId);
        }
        if (!competencyRepository.existsById(req.competencyId())) {
            throw new BusinessException(ErrorCode.COMPETENCY_NOT_FOUND, req.competencyId());
        }
        // weight 중복이면 409 (다른 competency가 쓰는 중)
        competencyMapRepository.findByIdOfferingIdAndWeight(offeringId, req.weight()).ifPresent(m -> {
            if (!m.getCompetencyId().equals(req.competencyId())) {
                throw new BusinessException(ErrorCode.OFFERING_COMPETENCY_WEIGHT_DUPLICATED, offeringId, req.weight());
            }
        });
        // upsert (없으면 생성, 있으면 수정)
        CurricularOfferingCompetencyMapId id = new CurricularOfferingCompetencyMapId(offeringId, req.competencyId());

        CurricularOfferingCompetencyMap map = competencyMapRepository.findById(id)
                .orElseGet(() -> CurricularOfferingCompetencyMap.builder().id(id).build());

        map.changeWeight(req.weight());

        competencyMapRepository.save(map);
    }

    // 학생성적 입력
    public void patchScore(Long offeringId, Long enrollmentId, Integer rawScore){
        Enrollment e = enrollmentRepository.findById(enrollmentId)
        .orElseThrow(() -> new BusinessException(
            ErrorCode.ENROLLMENT_NOT_FOUND, enrollmentId
        ));

        // 1️⃣ 다른 교과의 enrollment 방지
        if (!e.getOfferingId().equals(offeringId)) {
            throw new BusinessException(ErrorCode.ENROLLMENT_OFFERING_MISMATCH);
        }

        // 2️⃣ 취소자는 점수 입력 불가
        if (e.getEnrollmentStatus() != EnrollmentStatus.ENROLLED) {
            throw new BusinessException(ErrorCode.ENROLLMENT_NOT_GRADEABLE);
        }

        // 3️⃣ 이미 성적 확정되었으면 수정 불가
        if (Boolean.TRUE.equals(e.getIsGradeConfirmed())) {
            throw new BusinessException(ErrorCode.GRADE_ALREADY_CONFIRMED);
        }

        // 4️⃣ 점수 반영
        e.updateRawScore(rawScore);
    }


}

// ===============================
// GradeCalculator
// ===============================
final class GradeCalculator {

    private GradeCalculator() {}

    // 90+ A, 80+ B, 70+ C, 60+ D, else F
    public static String fromScore(int score) {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "F";
    }

    public static boolean isPassed(String grade) {
        return !"F".equalsIgnoreCase(grade);
    }
}