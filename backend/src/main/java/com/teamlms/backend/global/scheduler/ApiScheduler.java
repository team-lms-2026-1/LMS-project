package com.teamlms.backend.global.scheduler;

import com.teamlms.backend.domain.job.service.WorknetApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiScheduler {

    private final WorknetApiService worknetApiService;

    // 매일 새벽 4시에 실행
    @Scheduled(cron = "0 0 4 * * *")
    public void runJobCollection() {
        log.info("========== [Scheduler] Daily Job Data Collection Start ==========");
        worknetApiService.fetchAndSavePostings();
        log.info("========== [Scheduler] Daily Job Data Collection End ==========");
    }
}