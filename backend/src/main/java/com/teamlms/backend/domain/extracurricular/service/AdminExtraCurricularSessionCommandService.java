package com.teamlms.backend.domain.extracurricular.service;

import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionUpdateRequest;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSession;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionVideo;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionCompletionRepository;
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
    private final ExtraCurricularSessionCompletionRepository completionRepository;

    @Transactional
    public void create(Long offeringId, ExtraCurricularSessionCreateRequest req) {

        // 0) offering 조회 + 락 (동시성 방어)
        ExtraCurricularOffering offering = offeringRepository.findByIdForUpdate(offeringId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND));

        // 0-1) 상태 검증: IN_PROGRESS에서만 세션 추가 가능
        if (offering.getStatus() != ExtraOfferingStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_NOT_ALLOWED_IN_CURRENT_OFFERING_STATUS);
        }

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

        // 3) storageKey 전역 중복 방지
        String storageKey = req.video().storageKey().trim();
        if (videoRepository.existsByStorageKey(storageKey)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_VIDEO_STORAGE_KEY_ALREADY_EXISTS);
        }

        // 4) 캡 초과 검증 (현재 합계 + 신규)
        Long currentSumPoint = sessionRepository.sumRewardPointByOfferingId(offeringId);
        Long currentSumHours = sessionRepository.sumRecognizedHoursByOfferingId(offeringId);

        long nextSumPoint = currentSumPoint + req.rewardPoint();
        long nextSumHours = currentSumHours + req.recognizedHours();

        if (nextSumPoint > offering.getRewardPointDefault()) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_REWARD_POINT_EXCEEDS_OFFERING_CAP);
        }
        if (nextSumHours > offering.getRecognizedHoursDefault()) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_RECOGNIZED_HOURS_EXCEEDS_OFFERING_CAP);
        }

        // 5) 세션 저장
        ExtraCurricularSession session = ExtraCurricularSession.builder()
            .extraOfferingId(offeringId)
            .sessionName(sessionName)
            .startAt(start)
            .endAt(end)
            .status(ExtraSessionStatus.OPEN)
            .rewardPoint(req.rewardPoint())
            .recognizedHours(req.recognizedHours())
            .build();
        sessionRepository.save(session);

        // 6) 비디오 저장
        ExtraCurricularSessionVideo video = ExtraCurricularSessionVideo.builder()
            .sessionId(session.getSessionId())
            .title(req.video().title().trim())
            .storageKey(storageKey)
            .durationSeconds(req.video().durationSeconds())
            .videoUrl(null)
            .build();
        videoRepository.save(video);

    }

    @Transactional
    public void updateSession(Long extraOfferingId, Long sessionId, ExtraCurricularSessionUpdateRequest req) {

        ExtraCurricularOffering offering = offeringRepository.findById(extraOfferingId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND));

        if (offering.getStatus() != ExtraOfferingStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_STATUS_LOCKED);
            // 또는 기존 정책대로 EXTRA_SESSION_STATUS_LOCKED 로 통일해도 됨
        }
        ExtraCurricularSession session = sessionRepository.findBySessionIdAndExtraOfferingId(sessionId, extraOfferingId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND));

        if (session.getStatus() != ExtraSessionStatus.OPEN) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_STATUS_LOCKED);
        }

        // 1) 동영상 변경 감지 (storageKey 기준)
        boolean videoChanged = false;

        ExtraCurricularSessionVideo video = videoRepository.findBySessionId(sessionId)
            .orElse(null); // 세션에 video가 반드시 존재하는 정책이면 예외로 바꿔도 됨

        if (req.getVideo() != null && req.getVideo().getStorageKey() != null) {
            String before = (video == null ? null : video.getStorageKey());
            String after = req.getVideo().getStorageKey();
            videoChanged = !Objects.equals(before, after);
        }

        // 2) session 필드 업데이트
        if (req.getSessionName() != null) session.setSessionName(req.getSessionName());
        if (req.getStartAt() != null) session.setStartAt(req.getStartAt());
        if (req.getEndAt() != null) session.setEndAt(req.getEndAt());
        if (req.getRewardPoint() != null) session.setRewardPoint(req.getRewardPoint());
        if (req.getRecognizedHours() != null) session.setRecognizedHours(req.getRecognizedHours());

        // 시간 검증
        if (session.getStartAt() != null && session.getEndAt() != null) {
            if (session.getEndAt().isBefore(session.getStartAt())) {
                throw new BusinessException(ErrorCode.EXTRA_SESSION_TIME_INVALID);
            }
        }

        // 3) video 업데이트 (없으면 생성해도 됨)
        if (req.getVideo() != null) {
            if (video == null) {
                video = ExtraCurricularSessionVideo.builder()
                    .sessionId(sessionId)
                    .title(req.getVideo().getTitle() != null ? req.getVideo().getTitle() : "영상")
                    .videoUrl(req.getVideo().getVideoUrl())
                    .storageKey(req.getVideo().getStorageKey())
                    .durationSeconds(req.getVideo().getDurationSeconds())
                    .build();
            } else {
                if (req.getVideo().getTitle() != null) video.setTitle(req.getVideo().getTitle());
                if (req.getVideo().getVideoUrl() != null) video.setVideoUrl(req.getVideo().getVideoUrl());
                if (req.getVideo().getStorageKey() != null) video.setStorageKey(req.getVideo().getStorageKey());
                if (req.getVideo().getDurationSeconds() != null) video.setDurationSeconds(req.getVideo().getDurationSeconds());
            }
            videoRepository.save(video);
        }

        // 4) 동영상 바뀌면 completion 전부 삭제
        if (videoChanged) {
            completionRepository.deleteAllBySessionId(sessionId);
        }

        // session은 dirty checking으로 저장됨
    }

    @Transactional
    public void changeStatus(Long offeringId, Long sessionId, ExtraSessionStatus targetStatus) {

        ExtraCurricularOffering offering =
            offeringRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND));

        if (offering.getStatus() != ExtraOfferingStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_STATUS_LOCKED);
        }
        ExtraCurricularSession session = sessionRepository.findBySessionIdAndExtraOfferingId(sessionId, offeringId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND));

        ExtraSessionStatus current = session.getStatus();

        // 전이 검증
        if (current == ExtraSessionStatus.CLOSED && targetStatus == ExtraSessionStatus.OPEN) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_STATUS_TRANSITION_NOT_ALLOWED);
        }
        if (current == ExtraSessionStatus.CANCELED && targetStatus != ExtraSessionStatus.CANCELED) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_STATUS_TRANSITION_NOT_ALLOWED);
        }

        // 변경
        session.setStatus(targetStatus);

        // CANCELED 처리 시 completion 전부 삭제
        if (targetStatus == ExtraSessionStatus.CANCELED) {
            completionRepository.deleteAllBySessionId(sessionId);
        }
    }

}
