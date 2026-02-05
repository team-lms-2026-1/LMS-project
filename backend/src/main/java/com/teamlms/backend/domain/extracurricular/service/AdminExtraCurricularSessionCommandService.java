package com.teamlms.backend.domain.extracurricular.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionCreateRequest;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSession;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionVideo;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionVideoRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminExtraCurricularSessionCommandService {

    private final ExtraCurricularOfferingRepository offeringRepository;
    private final ExtraCurricularSessionRepository sessionRepository;
    private final ExtraCurricularSessionVideoRepository videoRepository;

    @Transactional
    public void create(Long offeringId, ExtraCurricularSessionCreateRequest req) {

        ExtraCurricularOffering offering = offeringRepository.findById(offeringId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND));

        // (선택) DRAFT에서만 세션 추가 허용하고 싶으면
        // if (offering.getStatus() != ExtraOfferingStatus.DRAFT) {
        //     throw new BusinessException(EXTRA_CURRICULAR_OFFERING_SESSION_NOT_CREATABLE);
        // }

        // 1) 기간 검증
        LocalDateTime start = req.startAt();
        LocalDateTime end = req.endAt();
        if (!end.isAfter(start)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_PERIOD_INVALID);
        }

        // 2) 회차명 중복(운영 내 유니크)
        String sessionName = req.sessionName().trim();
        if (sessionRepository.existsByExtraOfferingIdAndSessionName(offeringId, sessionName)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_NAME_ALREADY_EXISTS);
        }

        // 3) storageKey 전역 중복 방지 (video 테이블 uq도 있지만 사전검증)
        String storageKey = req.video().storageKey().trim();
        if (videoRepository.existsByStorageKey(storageKey)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_VIDEO_STORAGE_KEY_ALREADY_EXISTS);
        }

        // 4) 세션 저장
        ExtraCurricularSession session = ExtraCurricularSession.builder()
            .extraOfferingId(offeringId)
            .sessionName(sessionName)
            .startAt(start)
            .endAt(end)
            .status(ExtraSessionStatus.OPEN) // 기본값은 서비스에서
            .rewardPoint(req.rewardPoint())
            .recognizedHours(req.recognizedHours())
            .build();

        sessionRepository.save(session);

        // 5) 비디오 저장 (1:1)
        ExtraCurricularSessionVideo video = ExtraCurricularSessionVideo.builder()
            .sessionId(session.getSessionId())
            .title(req.video().title().trim())
            .storageKey(storageKey)
            .durationSeconds(req.video().durationSeconds())
            .videoUrl(null) // presigned/CloudFront URL은 조회 시 생성하는 걸 권장
            .build();

        videoRepository.save(video);

        // 6) 운영 default 포인트/시간 재계산 (합계)
        // (간단버전) - 세션 목록 sum 쿼리 메서드가 있으면 그걸로 업데이트
        Long sumPoint = sessionRepository.sumRewardPointByOfferingId(offeringId);
        Long sumHours = sessionRepository.sumRecognizedHoursByOfferingId(offeringId);

        offering.updateDefaultRewardsFromSessions(sumPoint, sumHours);

    }
}
