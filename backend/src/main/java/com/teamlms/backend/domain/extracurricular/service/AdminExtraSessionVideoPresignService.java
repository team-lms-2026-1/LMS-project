package com.teamlms.backend.domain.extracurricular.service;

import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraSessionVideoPresignRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraSessionVideoPresignResponse;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.s3.presign.S3PresignService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminExtraSessionVideoPresignService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "video/mp4"
        // 필요하면 "video/quicktime" 등 추가
    );

    private final ExtraCurricularOfferingRepository offeringRepository;
    private final S3PresignService s3PresignService;

    @Transactional(readOnly = true)
    public ExtraSessionVideoPresignResponse presign(Long extraOfferingId, ExtraSessionVideoPresignRequest req) {

        ExtraCurricularOffering offering = offeringRepository.findById(extraOfferingId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND));

        // 정책: IN_PROGRESS에서만 업로드 허용
        if (offering.getStatus() != ExtraOfferingStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_VIDEO_UPLOAD_NOT_ALLOWED_STATUS);
        }

        String contentType = normalize(req.contentType());
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_VIDEO_CONTENT_TYPE_NOT_ALLOWED);
        }

        var presigned = s3PresignService.presignPutExtraSessionVideo(extraOfferingId, contentType);

        return new ExtraSessionVideoPresignResponse(
            presigned.storageKey(),
            presigned.uploadUrl(),
            presigned.expiresAt()
        );
    }

    private String normalize(String s) {
        return s == null ? "" : s.trim().toLowerCase(Locale.ROOT);
    }
}
