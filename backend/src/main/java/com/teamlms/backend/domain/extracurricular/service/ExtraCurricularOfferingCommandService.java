package com.teamlms.backend.domain.extracurricular.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.competency.repository.CompetencyRepository;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingPatchRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingBulkUpdateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingPatchRequest;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOfferingCompetencyMap;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOfferingCompetencyMapId;
import com.teamlms.backend.domain.extracurricular.enums.CompletionStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionCompletionRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ExtraCurricularOfferingCommandService {

    private final ExtraCurricularOfferingRepository offeringRepository;
    private final ExtraCurricularSessionRepository sessionRepository;
    private final ExtraCurricularSessionCompletionRepository completionRepository;
    private final ExtraCurricularApplicationRepository applicationRepository;

    private final CompetencyRepository competencyRepository;
    private final ExtraCurricularOfferingCompetencyMapRepository competencyMapRepository;

    // =====================
    // 개설 생성
    // =====================
    public void create(ExtraCurricularOfferingCreateRequest req) {

        if (!req.operationEndAt().isAfter(req.operationStartAt())) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_PERIOD_INVALID);
        }

        String offeringCode = req.extraOfferingCode().trim();
        if (offeringRepository.existsByExtraOfferingCode(offeringCode)) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_CODE_ALREADY_EXISTS);
        }

        ExtraCurricularOffering e = ExtraCurricularOffering.builder()
                .extraCurricularId(req.extraCurricularId())
                .extraOfferingCode(offeringCode)
                .extraOfferingName(req.extraOfferingName().trim())
                .hostContactName(trimOrNull(req.hostContactName()))
                .hostContactPhone(trimOrNull(req.hostContactPhone()))
                .hostContactEmail(trimOrNull(req.hostContactEmail()))
                .rewardPointDefault(req.rewardPointDefault())
                .recognizedHoursDefault(req.recognizedHoursDefault())
                .semesterId(req.semesterId())
                .operationStartAt(req.operationStartAt())
                .operationEndAt(req.operationEndAt())
                .status(ExtraOfferingStatus.DRAFT)
                .build();

        offeringRepository.save(e);
    }

    // =====================
    // 기본 수정 (DRAFT만)
    // =====================
    public void patch(Long extraOfferingId, ExtraCurricularOfferingPatchRequest req) {

        ExtraCurricularOffering offering = offeringRepository.findById(extraOfferingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND, extraOfferingId));

        if (offering.getStatus() != ExtraOfferingStatus.DRAFT) {
            throw new BusinessException(
                    ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_EDITABLE,
                    extraOfferingId, offering.getStatus()
            );
        }

        var nextStart = (req.operationStartAt() != null) ? req.operationStartAt() : offering.getOperationStartAt();
        var nextEnd = (req.operationEndAt() != null) ? req.operationEndAt() : offering.getOperationEndAt();

        if (!nextEnd.isAfter(nextStart)) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_PERIOD_INVALID);
        }

        String nextCode = null;
        if (req.extraOfferingCode() != null) {
            nextCode = req.extraOfferingCode().trim();
            if (nextCode.isBlank()) {
                throw new BusinessException(ErrorCode.OFFERING_CODE_EMPTY);
            }

            boolean duplicated = offeringRepository
                    .existsByExtraOfferingCodeAndExtraOfferingIdNot(nextCode, extraOfferingId);

            if (duplicated) {
                throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_CODE_ALREADY_EXISTS, nextCode);
            }
        }

        offering.patchForDraft(
                nextCode,
                trimOrNull(req.extraOfferingName()),
                trimOrNull(req.hostContactName()),
                trimOrNull(req.hostContactPhone()),
                trimOrNull(req.hostContactEmail()),
                req.rewardPointDefault(),
                req.recognizedHoursDefault(),
                req.semesterId(),
                req.operationStartAt(),
                req.operationEndAt()
        );
    }

    private String trimOrNull(String v) {
        return (v == null) ? null : v.trim();
    }

    // =====================
    // 상태 변경 (한 방향, 한 칸)
    // =====================
    public void changeStatus(Long extraOfferingId, ExtraOfferingStatus targetStatus) {

        ExtraCurricularOffering offering = offeringRepository.findById(extraOfferingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND, extraOfferingId));

        ExtraOfferingStatus current = offering.getStatus();

        validateTransitionOneStepForward(current, targetStatus);

        // ✅ IN_PROGRESS -> COMPLETED 전환 시 이수 확정
        if (current == ExtraOfferingStatus.IN_PROGRESS && targetStatus == ExtraOfferingStatus.COMPLETED) {
            confirmExtraCompletions(extraOfferingId);
        }

        offering.changeStatus(targetStatus);
    }

    private void validateTransitionOneStepForward(ExtraOfferingStatus from, ExtraOfferingStatus to) {

        if (from == ExtraOfferingStatus.COMPLETED && to != ExtraOfferingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_STATUS_LOCKED, from, to);
        }

        // ✅ "무조건 DRAFT부터 한방향 한칸" => CANCELED 전이 금지
        if (to == ExtraOfferingStatus.CANCELED || from == ExtraOfferingStatus.CANCELED) {
            throw new BusinessException(ErrorCode.INVALID_EXTRA_CURRICULAR_OFFERING_STATUS_TRANSITION, from, to);
        }

        if (from == ExtraOfferingStatus.DRAFT && to == ExtraOfferingStatus.OPEN) return;
        if (from == ExtraOfferingStatus.OPEN && to == ExtraOfferingStatus.ENROLLMENT_CLOSED) return;
        if (from == ExtraOfferingStatus.ENROLLMENT_CLOSED && to == ExtraOfferingStatus.IN_PROGRESS) return;
        if (from == ExtraOfferingStatus.IN_PROGRESS && to == ExtraOfferingStatus.COMPLETED) return;

        throw new BusinessException(ErrorCode.INVALID_EXTRA_CURRICULAR_OFFERING_STATUS_TRANSITION, from, to);
    }

    // =====================
    // COMPLETED 확정
    // - apply_status=APPLIED 대상만
    // - CANCELED 제외 모든 세션 출석 완료 => PASSED
    // =====================
    private void confirmExtraCompletions(Long extraOfferingId) {

        List<Long> validSessionIds = sessionRepository.findValidSessionIds(extraOfferingId);

        if (validSessionIds.isEmpty()) {
            throw new BusinessException(ErrorCode.EXTRA_OFFERING_NOT_COMPLETABLE_NO_SESSION);
        }

        List<Long> applicationIds = applicationRepository.findApplicationIdsByOfferingAndApplyStatus(
                extraOfferingId,
                ExtraApplicationApplyStatus.APPLIED
        );

        for (Long applicationId : applicationIds) {

            long attendedCount = completionRepository.countAttendedByApplicationIdAndSessionIds(
                    applicationId, validSessionIds
            );

            boolean passed = (attendedCount == validSessionIds.size());

            if (passed) {
                applicationRepository.updateCompletionStatusAndPassedAt(
                        applicationId,
                        CompletionStatus.PASSED,
                        LocalDateTime.now()
                );
            } else {
                applicationRepository.updateCompletionStatusAndPassedAt(
                        applicationId,
                        CompletionStatus.FAILED,
                        null
                );
            }
        }
    }

    // =====================
    // 세션 수정/취소(OPEN에서만) 시 completion 전부 삭제
    // =====================
    public void invalidateSessionCompletions(Long extraOfferingId, Long sessionId) {

        ExtraCurricularOffering offering = offeringRepository.findById(extraOfferingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND, extraOfferingId));

        if (offering.getStatus() != ExtraOfferingStatus.OPEN) {
            throw new BusinessException(
                    ErrorCode.EXTRA_CURRICULAR_SESSION_NOT_EDITABLE,
                    extraOfferingId, offering.getStatus()
            );
        }

        completionRepository.deleteBySessionId(sessionId);
    }

    // =====================
    // 역량 맵핑 (Offering 기준)
    // =====================
    public void patchMapping(Long extraOfferingId, ExtraOfferingCompetencyMappingBulkUpdateRequest req) {

        ExtraCurricularOffering offering = offeringRepository.findById(extraOfferingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND, extraOfferingId));

        if (offering.getStatus() == ExtraOfferingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.OFFERING_COMPETENCY_MAPPING_NOT_EDITABLE, extraOfferingId);
        }

        var reqs = req.mappings();

        // 요청 weight 중복 방지
        long distinctWeight = reqs.stream()
                .map(ExtraOfferingCompetencyMappingPatchRequest::weight)
                .distinct()
                .count();
        if (distinctWeight != reqs.size()) {
            throw new BusinessException(ErrorCode.OFFERING_COMPETENCY_WEIGHT_DUPLICATED, extraOfferingId);
        }

        // competency 존재 검증
        var ids = reqs.stream()
                .map(ExtraOfferingCompetencyMappingPatchRequest::competencyId)
                .distinct()
                .toList();

        long existCount = competencyRepository.countByCompetencyIdIn(ids);
        if (existCount != ids.size()) {
            throw new BusinessException(ErrorCode.COMPETENCY_ID_INVALID);
        }

        // ✅ 기존 맵핑 전부 삭제 후 재생성
        competencyMapRepository.deleteByIdExtraOfferingId(extraOfferingId);

        var entities = reqs.stream().map(r -> {
            var id = new ExtraCurricularOfferingCompetencyMapId(extraOfferingId, r.competencyId());
            var map = ExtraCurricularOfferingCompetencyMap.builder().id(id).build();
            map.changeWeight(r.weight());
            return map;
        }).toList();

        competencyMapRepository.saveAll(entities);
    }
}
