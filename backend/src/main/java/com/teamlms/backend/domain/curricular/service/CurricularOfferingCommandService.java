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
    // 媛쒖꽕 ?앹꽦
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
    // 湲곕낯 ?섏젙 (DRAFT留?
    // =====================
    public void patchBasic(Long offeringId, CurricularOfferingUpdateRequest req) {

        CurricularOffering offering = curricularOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        if (offering.getStatus() != OfferingStatus.DRAFT) {
            throw new BusinessException(ErrorCode.OFFERING_NOT_EDITABLE, offeringId, offering.getStatus());
        }

        // offeringCode ?섏젙(以묐났 諛⑹?)
        if (req.offeringCode() != null && !req.offeringCode().isBlank()) {
            String nextCode = req.offeringCode().trim();
            if (!nextCode.equals(offering.getOfferingCode())
                    && curricularOfferingRepository.existsByOfferingCode(nextCode)) {
                throw new BusinessException(ErrorCode.CURRICULAR_OFFERING_CODE_ALREADY_EXISTS, nextCode);
            }
        }

        // semesterId ?섏젙(議댁옱 寃利?
        if (req.semesterId() != null) {
            if (!semesterRepository.existsById(req.semesterId())) {
                throw new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, req.semesterId());
            }
        }

        // 援먯닔 蹂寃???寃利?
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
    // ?곹깭 蹂寃?
    // - OPEN ??ENROLLMENT_CLOSED ?먮룞 ?꾪솚? "?섍컯?좎껌 ?쒕퉬???먯꽌 泥섎━ 異붿쿇
    // - ?ш린?쒕뒗 "?섎룞 ?곹깭 蹂寃? + COMPLETED ???뺤젙 濡쒖쭅 ?대떦
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

        // ?뵦 IN_PROGRESS -> COMPLETED ?꾪솚 ?? ?꾩닔 泥댄겕 + ?깆쟻 ?뺤젙
        if (current == OfferingStatus.IN_PROGRESS && targetStatus == OfferingStatus.COMPLETED) {
            validateCompetencyMappingCompleted(offeringId);
            confirmGrades(offering, actorAccountId);
        }

        offering.changeStatus(targetStatus);
    }

    // =====================
    // ?곹깭 ?꾩씠 寃利?
    // =====================
    private void validateTransition(OfferingStatus from, OfferingStatus to) {

        // ??COMPLETED???좉툑 ?곹깭: ?대뼡 ?곹깭濡쒕룄 蹂寃?遺덇?(痍⑥냼 ?ы븿)
        if (from == OfferingStatus.COMPLETED && to != OfferingStatus.COMPLETED) {
            throw new BusinessException(
                ErrorCode.CURRICULAR_OFFERING_STATUS_LOCKED,
                from, to
            );
        }

        // ???덉슜 ?꾩씠
        if (from == OfferingStatus.DRAFT && to == OfferingStatus.OPEN) return;
        if (from == OfferingStatus.OPEN && to == OfferingStatus.ENROLLMENT_CLOSED) return;

        if (from == OfferingStatus.OPEN && to == OfferingStatus.IN_PROGRESS) return;
        if (from == OfferingStatus.ENROLLMENT_CLOSED && to == OfferingStatus.IN_PROGRESS) return;

        if (from == OfferingStatus.IN_PROGRESS && to == OfferingStatus.COMPLETED) return;

        // ?몄젣??痍⑥냼???덉슜 (?? COMPLETED???꾩뿉???대? 留됲옒)
        if (to == OfferingStatus.CANCELED) return;

        throw new BusinessException(
            ErrorCode.INVALID_OFFERING_STATUS_TRANSITION,
            from, to
        );
    }

    // =====================
    // COMPLETED ?꾪솚 議곌굔: ??웾 留ㅽ븨 6媛?1~6) ?꾩꽦 ?щ?
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
    // COMPLETED ?꾪솚 議곌굔: ?깆쟻 紐⑤몢 ?낅젰 + ?깆쟻 ?뺤젙(grade/?꾨즺?곹깭)
    // =====================
    private void confirmGrades(CurricularOffering offering, Long actorAccountId) {

        List<Enrollment> enrollments = enrollmentRepository.findByOfferingId(offering.getOfferingId());
        String curricularName = curricularRepository.findById(offering.getCurricularId())
                .map(Curricular::getCurricularName)
                .orElse("援먭낵");

        for (Enrollment e : enrollments) {

            // ??1) 痍⑥냼?먮뒗 ?깆쟻 ?뺤젙 ????꾨떂
            if (e.getEnrollmentStatus() != EnrollmentStatus.ENROLLED) {
                continue;
            }

            // ??2) ?ы샇異?諛⑹? (idempotent)
            if (Boolean.TRUE.equals(e.getIsGradeConfirmed())) {
                continue;
            }

            // ??3) ?먯닔 誘몄엯?μ? ?덉쇅
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

        String safeName = (curricularName == null || curricularName.isBlank()) ? "\uad50\uacfc" : curricularName;
        String title = "\uad50\uacfc \uc131\uc801";
        String message = "\uad50\uacfc '" + safeName + "' \uc131\uc801\uc774 \ud655\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4. (\ub4f1\uae09: " + grade + ")";
        String linkUrl = "/curricular/grade-reports";

        alarmCommandService.createAlarm(
                studentAccountId,
                AlarmType.CURRICULAR_GRADE_CONFIRMED,
                title,
                message,
                linkUrl
        );
    }

    private void notifyCurricularScoreAssigned(Long studentAccountId, String curricularName, Integer rawScore) {
        if (studentAccountId == null || rawScore == null) {
            return;
        }

        String safeName = (curricularName == null || curricularName.isBlank()) ? "\uad50\uacfc" : curricularName;
        String title = "\uad50\uacfc \uc810\uc218";
        String message = "\uad50\uacfc '" + safeName + "' \uc810\uc218\uac00 \uc785\ub825\ub418\uc5c8\uc2b5\ub2c8\ub2e4. (\uc810\uc218: " + rawScore + ")";
        String linkUrl = "/curricular/grade-reports";

        alarmCommandService.createAlarm(
                studentAccountId,
                AlarmType.CURRICULAR_SCORE_ASSIGNED,
                title,
                message,
                linkUrl
        );
    }

    // =====================
    // 援먯닔 寃利?怨듯넻
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


    // ??웾 留듯븨
    public void patchMapping(Long offeringId, OfferingCompetencyMappingBulkUpdateRequest req) {

        CurricularOffering offering = curricularOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        if (offering.getStatus() == OfferingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.OFFERING_COMPETENCY_MAPPING_NOT_EDITABLE, offeringId);
        }

        var reqs = req.mappings();

        // ?붿껌 weight 以묐났 諛⑹? (swap ?ы븿?댁꽌 理쒖쥌 以묐났留?留됱쑝硫???
        long distinctWeight = reqs.stream()
                .map(OfferingCompetencyMappingPatchRequest::weight)
                .distinct()
                .count();
        if (distinctWeight != reqs.size()) {
            throw new BusinessException(ErrorCode.OFFERING_COMPETENCY_WEIGHT_DUPLICATED, offeringId);
        }

        // competency 議댁옱 寃利?(N踰?existsById ?????諛⑹뿉)
        var ids = reqs.stream().map(OfferingCompetencyMappingPatchRequest::competencyId).distinct().toList();
        long existCount = competencyRepository.countByCompetencyIdIn(ids); // ?대윴 硫붿꽌???섎굹 異붽? 異붿쿇
        if (existCount != ids.size()) {
            throw new BusinessException(ErrorCode.COMPETENCY_NOT_FOUND, "some competencyId not found");
        }

        // ???듭떖: 湲곗〈 留듯븨 ?꾨? ??젣 ???ъ깮??
        competencyMapRepository.deleteByIdOfferingId(offeringId);

        var entities = reqs.stream().map(r -> {
            var id = new CurricularOfferingCompetencyMapId(offeringId, r.competencyId());
            var map = CurricularOfferingCompetencyMap.builder().id(id).build();
            map.changeWeight(r.weight());
            return map;
        }).toList();

        competencyMapRepository.saveAll(entities);
    }

    // ?숈깮?깆쟻 ?낅젰
    // ?숈깮?깆쟻 ?낅젰
    public void patchScore(Long offeringId, Long enrollmentId, Integer rawScore, Long actorAccountId){

        // ??0) 援먭낵?댁쁺(Offering) ?곹깭 ?뺤씤: IN_PROGRESS/COMPLETED ???뚮쭔 ?깆쟻 ?낅젰 媛??
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

        // 1截뤴깵 ?ㅻⅨ 援먭낵??enrollment 諛⑹?
        if (!e.getOfferingId().equals(offeringId)) {
            throw new BusinessException(ErrorCode.ENROLLMENT_OFFERING_MISMATCH);
        }

        // 2截뤴깵 痍⑥냼?먮뒗 ?먯닔 ?낅젰 遺덇?
        if (e.getEnrollmentStatus() != EnrollmentStatus.ENROLLED) {
            throw new BusinessException(ErrorCode.ENROLLMENT_NOT_GRADEABLE);
        }

        // 3截뤴깵 ?대? ?깆쟻 ?뺤젙?섏뿀?쇰㈃ ?섏젙 遺덇?
        if (Boolean.TRUE.equals(e.getIsGradeConfirmed())
                && offering.getStatus() != OfferingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.GRADE_ALREADY_CONFIRMED);
        }

        // 4截뤴깵 ?먯닔 諛섏쁺
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

        boolean changed = beforeScore == null || !beforeScore.equals(rawScore);
        if (changed) {
            String curricularName = curricularRepository.findById(offering.getCurricularId())
                    .map(Curricular::getCurricularName)
                    .orElse("\uad50\uacfc");
            notifyCurricularScoreAssigned(e.getStudentAccountId(), curricularName, rawScore);
        }
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
