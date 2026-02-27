package com.teamlms.backend.domain.community.scheduler;

import com.teamlms.backend.domain.community.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NoticeAlarmScheduler {

    private final NoticeService noticeService;

    @Scheduled(fixedDelayString = "${notice.alarm.schedule.delay-ms:43200000}")
    public void sendPendingNoticeAlarms() {
        try {
            int sentCount = noticeService.sendPendingNoticeAlarms();
            if (sentCount > 0) {
                log.info("Sent notice alarms for {} notice(s).", sentCount);
            }
        } catch (Exception e) {
            log.error("Failed to send pending notice alarms.", e);
        }
    }
}
