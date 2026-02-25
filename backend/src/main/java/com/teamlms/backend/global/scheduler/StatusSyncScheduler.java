package com.teamlms.backend.global.scheduler;

import com.teamlms.backend.domain.mentoring.repository.MentoringRecruitmentRepository;
import com.teamlms.backend.domain.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 날짜 기반 상태 자동 동기화 스케줄러
 *
 * [멘토링 모집 공고]
 * - DRAFT → OPEN   : 모집 시작일이 됐고 아직 종료 전인 경우
 * - OPEN  → CLOSED : 모집 종료일이 지난 경우
 *
 * [설문]
 * - DRAFT → OPEN   : 설문 시작일이 됐고 아직 종료 전인 경우
 * - OPEN  → CLOSED : 설문 종료일이 지난 경우
 *
 * 1분마다 실행 (처리 완료 후 1분 뒤 재실행)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StatusSyncScheduler {

    private final MentoringRecruitmentRepository recruitmentRepository;
    private final SurveyRepository surveyRepository;

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void syncStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // ── 멘토링 모집 공고 ──
        int mentoringOpened = recruitmentRepository.bulkOpenByDate(now);
        int mentoringClosed = recruitmentRepository.bulkCloseByDate(now);
        if (mentoringOpened > 0 || mentoringClosed > 0) {
            log.info("[StatusSyncScheduler] 멘토링 모집 공고 - DRAFT→OPEN: {}건, OPEN→CLOSED: {}건",
                    mentoringOpened, mentoringClosed);
        }

        // ── 설문 ──
        int surveyOpened = surveyRepository.bulkOpenByDate(now);
        int surveyClosed = surveyRepository.bulkCloseByDate(now);
        if (surveyOpened > 0 || surveyClosed > 0) {
            log.info("[StatusSyncScheduler] 설문 - DRAFT→OPEN: {}건, OPEN→CLOSED: {}건",
                    surveyOpened, surveyClosed);
        }
    }
}
