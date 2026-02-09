package com.teamlms.backend.domain.alarm.service;

import com.teamlms.backend.domain.alarm.entity.Alarm;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.repository.AlarmRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AlarmCommandService {

    private final AlarmRepository alarmRepository;

    public Long createAlarm(Long recipientAccountId, AlarmType type, String title, String message, String linkUrl) {
        Alarm alarm = Alarm.builder()
                .recipientAccountId(recipientAccountId)
                .type(type)
                .title(title)
                .message(message)
                .linkUrl(linkUrl)
                .build();

        return alarmRepository.save(alarm).getAlarmId();
    }

    public void markRead(Long accountId, Long alarmId) {
        Alarm alarm = alarmRepository.findByAlarmIdAndRecipientAccountId(alarmId, accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        alarm.markRead(LocalDateTime.now());
    }

    public int markAllRead(Long accountId) {
        return alarmRepository.markAllRead(accountId, LocalDateTime.now());
    }
}
