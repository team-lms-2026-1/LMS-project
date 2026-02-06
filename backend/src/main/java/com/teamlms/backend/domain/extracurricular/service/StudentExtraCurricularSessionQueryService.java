package com.teamlms.backend.domain.extracurricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCurricularSessionDetailRow;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCurricularSessionListItem;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentExtraCurricularSessionQueryService {

    private final ExtraCurricularApplicationRepository applicationRepository;
    private final ExtraCurricularSessionRepository sessionRepository;
    private final ExtraSessionVideoPreviewUrlService previewUrlService;

    @Transactional(readOnly = true)
    public Page<StudentExtraCurricularSessionListItem> list(
        Long studentAccountId,
        Long extraOfferingId,
        String keyword,
        Pageable pageable
    ) {
        boolean applied = applicationRepository.existsByExtraOfferingIdAndStudentAccountIdAndApplyStatus(
            extraOfferingId,
            studentAccountId,
            ExtraApplicationApplyStatus.APPLIED
        );
        
        Long applicationId = applicationRepository
            .findAppliedApplicationId(extraOfferingId, studentAccountId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND));


        if (!applied) {
            // 학생은 존재 숨김이 깔끔 -> 404 추천
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND);
            // 또는 ErrorCode.EXTRA_SESSION_NOT_FOUND 로 통일해도 됨
        }

        // ✅ 학생은 OPEN만
        return sessionRepository.findStudentSessionList(extraOfferingId, applicationId, keyword, pageable);
    }
    
    @Transactional(readOnly = true)
    public ExtraCurricularSessionDetailResponse getDetail(
        Long studentAccountId,
        Long extraOfferingId,
        Long sessionId
    ) {
        boolean applied = applicationRepository.existsByExtraOfferingIdAndStudentAccountIdAndApplyStatus(
            extraOfferingId,
            studentAccountId,
            ExtraApplicationApplyStatus.APPLIED
        );

        // ✅ 학생은 “존재 숨김”이 깔끔해서 404 추천
        if (!applied) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND);
        }

        StudentExtraCurricularSessionDetailRow row =
            sessionRepository.findStudentSessionDetail(extraOfferingId, sessionId);

        if (row == null) {
            // 세션이 없거나, CANCELED라서 걸러진 경우
            throw new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND);
        }

        String previewUrl = previewUrlService.createPreviewUrl(row.storageKey());

        return new ExtraCurricularSessionDetailResponse(
            row.sessionId(),
            row.extraOfferingId(),
            row.sessionName(),
            row.status().name(),
            row.startAt().toString(),
            row.endAt().toString(),
            row.rewardPoint(),
            row.recognizedHours(),
            new ExtraCurricularSessionDetailResponse.VideoDto(
                row.videoId(),
                row.videoTitle(),
                (row.durationSeconds() == null) ? null : row.durationSeconds().longValue(),
                previewUrl
            )
        );
    }
}
