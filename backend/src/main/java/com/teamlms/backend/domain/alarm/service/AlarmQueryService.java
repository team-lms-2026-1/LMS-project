package com.teamlms.backend.domain.alarm.service;

import com.teamlms.backend.domain.alarm.api.dto.AlarmResponse;
import com.teamlms.backend.domain.alarm.repository.AlarmRepository;
import com.teamlms.backend.global.i18n.LocaleUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlarmQueryService {

    private final AlarmRepository alarmRepository;
    private final MessageSource messageSource;
    private final ObjectMapper objectMapper;

    public Page<AlarmResponse> getMyAlarms(Long accountId, Pageable pageable) {
        Locale locale = LocaleUtil.toLocale(LocaleUtil.getCurrentLocale());
        return alarmRepository.findByRecipientAccountId(accountId, pageable)
                .map(alarm -> AlarmResponse.of(
                        alarm,
                        resolveTitle(alarm, locale),
                        resolveMessage(alarm, locale)
                ));
    }

    public long getUnreadCount(Long accountId) {
        return alarmRepository.countByRecipientAccountIdAndReadAtIsNull(accountId);
    }

    private String resolveTitle(com.teamlms.backend.domain.alarm.entity.Alarm alarm, Locale locale) {
        String key = alarm.getTitleKey();
        if (key == null || key.isBlank()) {
            return alarm.getTitle();
        }
        try {
            return messageSource.getMessage(key, null, locale);
        } catch (Exception e) {
            return alarm.getTitle();
        }
    }

    private String resolveMessage(com.teamlms.backend.domain.alarm.entity.Alarm alarm, Locale locale) {
        String key = alarm.getMessageKey();
        if (key == null || key.isBlank()) {
            return alarm.getMessage();
        }
        Object[] args = parseArgs(alarm.getMessageArgs());
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            return alarm.getMessage();
        }
    }

    private Object[] parseArgs(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, Object[].class);
        } catch (Exception e) {
            return null;
        }
    }
}
