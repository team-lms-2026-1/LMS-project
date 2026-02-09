package com.teamlms.backend.domain.extracurricular.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantBaseRow;
import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantRow;
import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraOfferingApplicantSessionRow;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingUserListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingItem;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ExtraCurricularOfferingQueryService {

    private final ExtraCurricularOfferingRepository offeringRepository;
    private final ExtraCurricularOfferingCompetencyMapRepository offeringCompetencyMapRepository;
    private final ExtraCurricularApplicationRepository applicationRepository;

    // (Admin)
    public Page<ExtraCurricularOfferingListItem> list(
            Long semesterId,
            String keyword,
            Pageable pageable
    ) {
        return offeringRepository.findAdminList(semesterId, keyword, pageable);
    }

    // (User)
    public Page<ExtraCurricularOfferingUserListItem> listForUser(
            String keyword,
            Pageable pageable
    ) {
        return offeringRepository.findOfferingUserList(keyword, pageable);
    }

    public ExtraCurricularOfferingBasicDetailResponse getBasicDetail(Long extraOfferingId) {

        ExtraCurricularOfferingBasicDetailResponse dto =
                offeringRepository.findBasicDetailById(extraOfferingId);

        if (dto == null) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND, extraOfferingId);
        }

        return dto;
    }

    // student application
    public List<ExtraOfferingCompetencyMappingItem> getMapping(Long extraOfferingId) {

        if (!offeringRepository.existsById(extraOfferingId)) {
            throw new BusinessException(
                    ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND,
                    extraOfferingId
            );
        }

        return offeringCompetencyMapRepository.findOfferingCompetencyMapping(extraOfferingId);
    }

    // 학생 전용 - 상세
    public ExtraCurricularOfferingBasicDetailResponse getBasicDetailForStudent(
        AuthUser authUser,
        Long extraOfferingId
    ) {
        assertStudentApplied(authUser, extraOfferingId);
        return getBasicDetail(extraOfferingId);
    }

    // 학생 전용 - 역량
    public List<ExtraOfferingCompetencyMappingItem> getMappingForStudent(
        AuthUser authUser,
        Long extraOfferingId
    ) {
        assertStudentApplied(authUser, extraOfferingId);
        return getMapping(extraOfferingId);
    }

    private void assertStudentApplied(AuthUser authUser, Long extraOfferingId) {
        if (authUser == null) return;
        if (!"STUDENT".equals(authUser.getAccountType())) return;

        var offering = offeringRepository.findById(extraOfferingId)
            .orElseThrow(() -> new BusinessException(
                ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND,
                extraOfferingId
            ));

        // OPEN/ENROLLMENT_CLOSED 상태는 미신청 학생도 조회 가능
        if (offering.getStatus() == com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.OPEN
            || offering.getStatus() == com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.ENROLLMENT_CLOSED) {
            return;
        }

        boolean applied = applicationRepository.existsByExtraOfferingIdAndStudentAccountIdAndApplyStatus(
            extraOfferingId,
            authUser.getAccountId(),
            ExtraApplicationApplyStatus.APPLIED
        );
        if (!applied) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND);
        }
    }

    //
    public Page<AdminExtraOfferingApplicantRow> listApplicants(
        Long extraOfferingId,
        String keyword,
        Pageable pageable
    ) {
        Page<AdminExtraOfferingApplicantBaseRow> basePage =
            offeringRepository.findApplicantPage(extraOfferingId, keyword, pageable);

        List<Long> applicationIds = basePage.getContent().stream()
            .map(AdminExtraOfferingApplicantBaseRow::applicationId)
            .toList();

        Map<Long, List<AdminExtraOfferingApplicantRow.SessionAttendance>> sessionsByAppId = new HashMap<>();

        List<AdminExtraOfferingApplicantSessionRow> sessionRows =
            offeringRepository.findApplicantSessionAttendance(extraOfferingId, applicationIds);

        for (AdminExtraOfferingApplicantSessionRow row : sessionRows) {
            sessionsByAppId
                .computeIfAbsent(row.applicationId(), k -> new ArrayList<>())
                .add(new AdminExtraOfferingApplicantRow.SessionAttendance(
                    row.sessionId(),
                    row.sessionTitle(),
                    row.sessionStatus(),
                    row.isAttended()
                ));
        }

        List<AdminExtraOfferingApplicantRow> content = basePage.getContent().stream()
            .map(base -> new AdminExtraOfferingApplicantRow(
                base.applicationId(),
                base.studentAccountId(),
                base.studentNo(),
                base.studentName(),
                base.deptName(),
                base.gradeLevel() == null ? null : String.valueOf(base.gradeLevel()),
                base.applyStatus(),
                base.completionStatus(),
                sessionsByAppId.getOrDefault(base.applicationId(), List.of())
            ))
            .toList();

        return new PageImpl<>(content, pageable, basePage.getTotalElements());
    }
}
