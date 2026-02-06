package com.teamlms.backend.domain.extracurricular.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraSessionAttendanceRequest;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionCompletion;
import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionCompletionRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularSessionRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
@Transactional
public class StudentExtraCurricularSessionCommandService {
    private final ExtraCurricularApplicationRepository applicationRepository;
    private final ExtraCurricularSessionRepository sessionRepository;
    private final ExtraCurricularSessionCompletionRepository completionRepository;

    public void markAttended(
        Long studentAccountId,
        Long extraOfferingId,
        Long sessionId,
        StudentExtraSessionAttendanceRequest req
    ) {
        // 1) 신청(APPLIED) 검증 + applicationId 확보 (없으면 숨김)
        Long applicationId = applicationRepository
            .findAppliedApplicationId(extraOfferingId, studentAccountId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND));

        // 2) 세션 조회 + offering mismatch 방어 + CANCELED 차단
        var session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND));

        if (!session.getExtraOfferingId().equals(extraOfferingId)) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND);
        }

        if (session.getStatus() == ExtraSessionStatus.CANCELED) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_NOT_FOUND);
        }

        // 3) DB 기준 durationSeconds 확보 (신뢰 가능한 기준)
        Integer durationSeconds = sessionRepository.findVideoDurationSeconds(sessionId);
        if (durationSeconds == null || durationSeconds <= 0) {
            throw new BusinessException(ErrorCode.EXTRA_SESSION_VIDEO_NOT_FOUND);
        }

        int watched = req.watchedSeconds();
        int threshold = Math.max(durationSeconds - 1, 0); // ✅ 1초 허용

        if (watched < threshold) {
            throw new BusinessException(
                ErrorCode.EXTRA_SESSION_WATCH_NOT_COMPLETED,
                watched, durationSeconds
            );
        }

        // 4) completion upsert (idempotent)
        ExtraCurricularSessionCompletion completion =
            completionRepository.findBySessionIdAndApplicationId(sessionId, applicationId)
                .orElseGet(() -> ExtraCurricularSessionCompletion.builder()
                    .sessionId(sessionId)
                    .applicationId(applicationId)
                    .isAttended(false)
                    .earnedPoint(0L)
                    .earnedHours(0L)
                    .watchedSeconds(0)
                    .build()
                );

        // 이미 attended면 그냥 성공 처리
        if (Boolean.TRUE.equals(completion.getIsAttended())) {
            return;
        }

        completion.setIsAttended(true);
        completion.setAttendedAt(LocalDateTime.now());
        completion.setWatchedSeconds(watched);

        // 출석 확정 시점 스냅샷
        completion.setEarnedPoint(session.getRewardPoint());
        completion.setEarnedHours(session.getRecognizedHours());

        completionRepository.save(completion);
    }
}
