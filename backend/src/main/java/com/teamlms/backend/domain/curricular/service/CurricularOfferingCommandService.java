package com.teamlms.backend.domain.curricular.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
import com.teamlms.backend.domain.competency.repository.CompetencyRepository;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUpdateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingBulkUpdateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingPatchRequest;
import com.teamlms.backend.domain.curricular.entity.Curricular;
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
    private final AlarmCommandService alarmCommandService;

    // =====================
    // Create offering
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

        if (curricularOfferingRepository.existsByCurricularIdAndSemesterId(curricularId, semesterId)) {
            throw new BusinessException(ErrorCode.CURRICULAR_OFFERING_ALREADY_EXISTS, curricularId);
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
    // Update draft offering
    // =====================
    public void patchBasic(Long offeringId, CurricularOfferingUpdateRequest req) {

        CurricularOffering offering = curricularOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        if (offering.getStatus() != OfferingStatus.DRAFT) {
            throw new BusinessException(ErrorCode.OFFERING_NOT_EDITABLE, offeringId, offering.getStatus());
        }

        // Validate offeringCode uniqueness
        if (req.offeringCode() != null && !req.offeringCode().isBlank()) {
            String nextCode = req.offeringCode().trim();
            if (!nextCode.equals(offering.getOfferingCode())
                    && curricularOfferingRepository.existsByOfferingCode(nextCode)) {
                throw new BusinessException(ErrorCode.CURRICULAR_OFFERING_CODE_ALREADY_EXISTS, nextCode);
            }
        }

        // Validate semesterId existence
        if (req.semesterId() != null) {
            if (!semesterRepository.existsById(req.semesterId())) {
                throw new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, req.semesterId());
            }
        }

        // Validate professor assignment
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
    // Status change
    // - OPEN -> ENROLLMENT_CLOSED is handled by enrollment flow
    // - This method handles manual transitions and COMPLETED confirmation
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

        // IN_PROGRESS -> COMPLETED: validate mappings and confirm grades
        if (current == OfferingStatus.IN_PROGRESS && targetStatus == OfferingStatus.COMPLETED) {
            validateCompetencyMappingCompleted(offeringId);
            confirmGrades(offering, actorAccountId);
        }

        offering.changeStatus(targetStatus);
    }

    // =====================
    // Validate transition
    // =====================
    private void validateTransition(OfferingStatus from, OfferingStatus to) {

        // COMPLETED is locked (no further transitions)
        if (from == OfferingStatus.COMPLETED && to != OfferingStatus.COMPLETED) {
            throw new BusinessException(
                ErrorCode.CURRICULAR_OFFERING_STATUS_LOCKED,
                from, to
            );
        }

        // Allowed transitions
        if (from == OfferingStatus.DRAFT && to == OfferingStatus.OPEN) return;
        if (from == OfferingStatus.OPEN && to == OfferingStatus.ENROLLMENT_CLOSED) return;

        if (from == OfferingStatus.OPEN && to == OfferingStatus.IN_PROGRESS) return;
        if (from == OfferingStatus.ENROLLMENT_CLOSED && to == OfferingStatus.IN_PROGRESS) return;

        if (from == OfferingStatus.IN_PROGRESS && to == OfferingStatus.COMPLETED) return;

        // Cancel/rollback allowed only before COMPLETED
        if (to == OfferingStatus.CANCELED) return;

        throw new BusinessException(
            ErrorCode.INVALID_OFFERING_STATUS_TRANSITION,
            from, to
        );
    }

    // =====================
    // COMPLETED transition requires 6 competency mappings (1~6)
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
    // COMPLETED transition requires all scores and grade confirmation
    // =====================
    private void confirmGrades(CurricularOffering offering, Long actorAccountId) {

        List<Enrollment> enrollments = enrollmentRepository.findByOfferingId(offering.getOfferingId());
        String curricularName = curricularRepository.findById(offering.getCurricularId())
                .map(Curricular::getCurricularName)
                .orElse("\uad50\uacfc");

        for (Enrollment e : enrollments) {

            // 1) Skip non-enrolled students
            if (e.getEnrollmentStatus() != EnrollmentStatus.ENROLLED) {
                continue;
            }

            // 2) Idempotent: skip already confirmed
            if (Boolean.TRUE.equals(e.getIsGradeConfirmed())) {
                continue;
            }

            // 3) Raw score required
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

            notifyCurricularGradeConfirmed(e.getStudentAccountId(), curricularName, grade);
        }
    }

    private void notifyCurricularGradeConfirmed(Long studentAccountId, String curricularName, String grade) {
        if (studentAccountId == null) {
            return;
        }

        String safeName = curricularName == null ? null : curricularName.trim();
        boolean hasName = safeName != null && !safeName.isBlank();

        String titleKey = "curricular.alarm.grade.confirmed.title";
        String messageKey;
        Object[] messageArgs;

        if (hasName) {
            messageKey = "curricular.alarm.grade.confirmed.message";
            messageArgs = new Object[] { safeName, grade };
        } else {
            messageKey = "curricular.alarm.grade.confirmed.message.default";
            messageArgs = new Object[] { grade };
        }
        String linkUrl = "/curricular/grade-reports";

        alarmCommandService.createAlarmI18n(
                studentAccountId,
                AlarmType.CURRICULAR_GRADE_CONFIRMED,
                titleKey,
                messageKey,
                messageArgs,
                linkUrl,
                null,
                null
        );
    }

    // =====================
    // Professor validation
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


    // Competency mapping
    public void patchMapping(Long offeringId, OfferingCompetencyMappingBulkUpdateRequest req) {

        CurricularOffering offering = curricularOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        if (offering.getStatus() == OfferingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.OFFERING_COMPETENCY_MAPPING_NOT_EDITABLE, offeringId);
        }

        var reqs = req.mappings();

        // Validate unique weights
        long distinctWeight = reqs.stream()
                .map(OfferingCompetencyMappingPatchRequest::weight)
                .distinct()
                .count();
        if (distinctWeight != reqs.size()) {
            throw new BusinessException(ErrorCode.OFFERING_COMPETENCY_WEIGHT_DUPLICATED, offeringId);
        }

        // Validate competency existence (bulk)
        var ids = reqs.stream().map(OfferingCompetencyMappingPatchRequest::competencyId).distinct().toList();
        long existCount = competencyRepository.countByCompetencyIdIn(ids); // Prefer bulk check over N+1
        if (existCount != ids.size()) {
            throw new BusinessException(ErrorCode.COMPETENCY_NOT_FOUND, "some competencyId not found");
        }

        // Replace existing mappings
        competencyMapRepository.deleteByIdOfferingId(offeringId);

        var entities = reqs.stream().map(r -> {
            var id = new CurricularOfferingCompetencyMapId(offeringId, r.competencyId());
            var map = CurricularOfferingCompetencyMap.builder().id(id).build();
            map.changeWeight(r.weight());
            return map;
        }).toList();

        competencyMapRepository.saveAll(entities);
    }

    // Update student score
    public void patchScore(Long offeringId, Long enrollmentId, Integer rawScore, Long actorAccountId){

        // 0) Offering status must be IN_PROGRESS or COMPLETED
        CurricularOffering offering = curricularOfferingRepository.findById(offeringId)
            .orElseThrow(() -> new BusinessException(
                ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId
            ));

        if (offering.getStatus() != OfferingStatus.IN_PROGRESS
                && offering.getStatus() != OfferingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.OFFERING_NOT_GRADEABLE_STATUS);
        }

        Enrollment e = enrollmentRepository.findById(enrollmentId)
        .orElseThrow(() -> new BusinessException(
            ErrorCode.ENROLLMENT_NOT_FOUND, enrollmentId
        ));

        // 1) Enrollment must belong to this offering
        if (!e.getOfferingId().equals(offeringId)) {
            throw new BusinessException(ErrorCode.ENROLLMENT_OFFERING_MISMATCH);
        }

        // 2) Canceled enrollments cannot be scored
        if (e.getEnrollmentStatus() != EnrollmentStatus.ENROLLED) {
            throw new BusinessException(ErrorCode.ENROLLMENT_NOT_GRADEABLE);
        }

        // 3) If grade confirmed and offering not completed, forbid change
        if (Boolean.TRUE.equals(e.getIsGradeConfirmed())
                && offering.getStatus() != OfferingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.GRADE_ALREADY_CONFIRMED);
        }

        // 4) Apply score update
        Integer beforeScore = e.getRawScore();
        e.updateRawScore(rawScore);

        if (offering.getStatus() == OfferingStatus.COMPLETED) {
            String grade = GradeCalculator.fromScore(rawScore);
            CompletionStatus completionStatus =
                    GradeCalculator.isPassed(grade) ? CompletionStatus.PASSED : CompletionStatus.FAILED;

            if (Boolean.TRUE.equals(e.getIsGradeConfirmed())) {
                e.updateConfirmedGrade(
                        grade,
                        completionStatus,
                        actorAccountId,
                        LocalDateTime.now()
                );
            } else {
                e.confirmGrade(
                        grade,
                        completionStatus,
                        actorAccountId,
                        LocalDateTime.now()
                );
            }
        }

        // 점수 입력 알림은 보내지 않음 (성적 확정 알림만 유지)
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
