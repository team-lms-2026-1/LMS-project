package com.teamlms.backend.domain.extracurricular.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionUpdateRequest;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSession;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionVideo;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionCompletionRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionVideoRepository;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
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
    private final ExtraCurricularApplicationRepository applicationRepository;
    private final AlarmCommandService alarmCommandService;

    @Transactional
    public void create(Long offeringId, ExtraCurricularSessionCreateRequest req) {

        ExtraCurricularOffering offering = offeringRepository.findByIdForUpdate(offeringId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND));

        // IN_PROGRESS에서만 세션 추가 가능
        if (offering.getStatus() != ExtraOfferingStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_NOT_ALLOWED_IN_CURRENT_OFFERING_STATUS);
        }

        // 기간 검증
        LocalDateTime start = req.startAt();
        LocalDateTime end = req.endAt();
        if (!end.isAfter(start)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_PERIOD_INVALID);
        }

        // 회차명 중복(운영 내 유니크)
        String sessionName = req.sessionName().trim();
        if (sessionRepository.existsByExtraOfferingIdAndSessionName(offeringId, sessionName)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_NAME_ALREADY_EXISTS);
        }

        // storageKey 전역 중복 방지
        String storageKey = req.video().storageKey().trim();
        if (videoRepository.existsByStorageKey(storageKey)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_VIDEO_STORAGE_KEY_ALREADY_EXISTS);
        }

        // 캡 초과 검증 (현재 합계 + 신규)
        Long currentSumPoint = sessionRepository.sumRewardPointByOfferingId(offeringId);
        Long currentSumHours = sessionRepository.sumRecognizedHoursByOfferingId(offeringId);

        long nextSumPoint = (currentSumPoint == null ? 0L : currentSumPoint) + req.rewardPoint();
        long nextSumHours = (currentSumHours == null ? 0L : currentSumHours) + req.recognizedHours();

        if (nextSumPoint > offering.getRewardPointDefault()) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_REWARD_POINT_EXCEEDS_OFFERING_CAP);
        }
        if (nextSumHours > offering.getRecognizedHoursDefault()) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_RECOGNIZED_HOURS_EXCEEDS_OFFERING_CAP);
        }

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

        ExtraCurricularSessionVideo video = ExtraCurricularSessionVideo.builder()
            .sessionId(session.getSessionId())
            .title(req.video().title().trim())
            .storageKey(storageKey)
            .durationSeconds(req.video().durationSeconds())
            .videoUrl(null)
            .build();
        videoRepository.save(video);

        notifySessionCreated(offering, session);
    }

    @Transactional
    public void updateSession(Long extraOfferingId, Long sessionId, ExtraCurricularSessionUpdateRequest req) {

        ExtraCurricularOffering offering = offeringRepository.findById(extraOfferingId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND));

        if (offering.getStatus() != ExtraOfferingStatus.IN_PROGRESS) {
            // 운영이 IN_PROGRESS가 아니면 수정 불가
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_EDITABLE);
        }

        ExtraCurricularSession session = sessionRepository.findBySessionIdAndExtraOfferingId(sessionId, extraOfferingId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND));

        if (session.getStatus() != ExtraSessionStatus.OPEN) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_STATUS_LOCKED);
        }

        // 동영상 변경 감지(storageKey 기준)
        boolean videoChanged = false;

        ExtraCurricularSessionVideo video = videoRepository.findBySessionId(sessionId).orElse(null);

        if (req.getVideo() != null && req.getVideo().getStorageKey() != null) {
            String before = (video == null ? null : video.getStorageKey());
            String after = req.getVideo().getStorageKey();
            videoChanged = !Objects.equals(before, after);
        }

        // session 업데이트
        if (req.getSessionName() != null) session.setSessionName(req.getSessionName());
        if (req.getStartAt() != null) session.setStartAt(req.getStartAt());
        if (req.getEndAt() != null) session.setEndAt(req.getEndAt());
        if (req.getRewardPoint() != null) session.setRewardPoint(req.getRewardPoint());
        if (req.getRecognizedHours() != null) session.setRecognizedHours(req.getRecognizedHours());

        // 기간 검증(정리본에서는 PERIOD_INVALID로 통일)
        if (session.getStartAt() != null && session.getEndAt() != null) {
            if (!session.getEndAt().isAfter(session.getStartAt())) {
                throw new BusinessException(ErrorCode.EXTRA_SESSION_PERIOD_INVALID);
            }
        }

        // video 업데이트(없으면 생성)
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

        if (videoChanged) {
            completionRepository.deleteAllBySessionId(sessionId);
            notifySessionVideoUploaded(offering, session);
        }
    }

    @Transactional
    public void changeStatus(Long offeringId, Long sessionId, ExtraSessionStatus targetStatus) {

        ExtraCurricularOffering offering = offeringRepository.findById(offeringId)
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

        session.setStatus(targetStatus);

        if (targetStatus == ExtraSessionStatus.CANCELED) {
            completionRepository.deleteAllBySessionId(sessionId);
        }
    }

    private void notifySessionCreated(ExtraCurricularOffering offering, ExtraCurricularSession session) {
        if (offering == null || session == null) {
            return;
        }

        List<Long> studentAccountIds = applicationRepository.findStudentAccountIdsByOfferingAndApplyStatus(
                offering.getExtraOfferingId(),
                ExtraApplicationApplyStatus.APPLIED
        );
        if (studentAccountIds.isEmpty()) {
            return;
        }

        String offeringName = (offering.getExtraOfferingName() == null || offering.getExtraOfferingName().isBlank())
                ? "\uBE44\uAD50\uACFC" : offering.getExtraOfferingName();
        String sessionName = (session.getSessionName() == null || session.getSessionName().isBlank())
                ? "\uD68C\uCC28" : session.getSessionName();

        String title = "\uBE44\uAD50\uACFC \uD68C\uCC28";
        String message = "\uBE44\uAD50\uACFC '" + offeringName + "' " + sessionName
                + " \uD68C\uCC28\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
        String linkUrl = "/extra-curricular/offerings/" + offering.getExtraOfferingId();

        for (Long studentAccountId : studentAccountIds) {
            if (studentAccountId == null) {
                continue;
            }

            alarmCommandService.createAlarm(
                    studentAccountId,
                    AlarmType.EXTRA_SESSION_CREATED,
                    title,
                    message,
                    linkUrl
            );
        }
    }

    private void notifySessionVideoUploaded(ExtraCurricularOffering offering, ExtraCurricularSession session) {
        if (offering == null || session == null) {
            return;
        }

        List<Long> studentAccountIds = applicationRepository.findStudentAccountIdsByOfferingAndApplyStatus(
                offering.getExtraOfferingId(),
                ExtraApplicationApplyStatus.APPLIED
        );
        if (studentAccountIds.isEmpty()) {
            return;
        }

        String offeringName = (offering.getExtraOfferingName() == null || offering.getExtraOfferingName().isBlank())
                ? "비교과" : offering.getExtraOfferingName();
        String sessionName = (session.getSessionName() == null || session.getSessionName().isBlank())
                ? "회차" : session.getSessionName();

        String title = "비교과 영상";
        String message = "비교과 '" + offeringName + "' " + sessionName + " 영상이 업로드되었습니다.";
        String linkUrl = "/extra-curricular/offerings/" + offering.getExtraOfferingId();

        for (Long studentAccountId : studentAccountIds) {
            if (studentAccountId == null) {
                continue;
            }

            alarmCommandService.createAlarm(
                    studentAccountId,
                    AlarmType.EXTRA_SESSION_VIDEO_UPLOADED,
                    title,
                    message,
                    linkUrl
            );
        }
    }
}
