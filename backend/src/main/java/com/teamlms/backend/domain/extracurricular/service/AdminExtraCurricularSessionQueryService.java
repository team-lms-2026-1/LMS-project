package com.teamlms.backend.domain.extracurricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.AdminExtraCurricularSessionDetailRow;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminExtraCurricularSessionQueryService {

    private final ExtraCurricularOfferingRepository offeringRepository;
    private final ExtraCurricularSessionRepository sessionRepository;
    private final ExtraSessionVideoPreviewUrlService previewUrlService;

    @Transactional(readOnly = true)
    public Page<ExtraCurricularSessionListItem> list(Long extraOfferingId, String keyword, Pageable pageable) {

        // 운영 존재 검증(선택이지만 관리자 화면에서는 보통 하는 편)
        if (!offeringRepository.existsById(extraOfferingId)) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND);
        }

        return sessionRepository.findAdminSessionList(extraOfferingId, keyword, pageable);
    }

    @Transactional(readOnly = true)
    public ExtraCurricularSessionDetailResponse getDetail(Long extraOfferingId, Long sessionId) {

        if (!offeringRepository.existsById(extraOfferingId)) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND);
        }

        AdminExtraCurricularSessionDetailRow row =
            sessionRepository.findAdminSessionDetail(extraOfferingId, sessionId);

        if (row == null) {
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
