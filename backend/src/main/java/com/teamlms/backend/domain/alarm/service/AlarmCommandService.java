package com.teamlms.backend.domain.alarm.service;

import com.teamlms.backend.domain.alarm.entity.Alarm;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.repository.AlarmRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.i18n.LocaleUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class AlarmCommandService {

    private final AlarmRepository alarmRepository;
    private final MessageSource messageSource;
    private final ObjectMapper objectMapper;

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

    public Long createAlarmI18n(
            Long recipientAccountId,
            AlarmType type,
            String titleKey,
            String messageKey,
            Object[] messageArgs,
            String linkUrl,
            String fallbackTitle,
            String fallbackMessage
    ) {
        Locale locale = LocaleUtil.toLocale(LocaleUtil.getCurrentLocale());
        String resolvedTitle = resolveMessage(titleKey, null, fallbackTitle, locale);
        String resolvedMessage = resolveMessage(messageKey, messageArgs, fallbackMessage, locale);

        Alarm alarm = Alarm.builder()
                .recipientAccountId(recipientAccountId)
                .type(type)
                .title(resolvedTitle != null ? resolvedTitle : "")
                .message(resolvedMessage != null ? resolvedMessage : "")
                .titleKey(titleKey)
                .messageKey(messageKey)
                .messageArgs(serializeArgs(messageKey, messageArgs))
                .linkUrl(linkUrl)
                .build();

        return alarmRepository.save(alarm).getAlarmId();
    }

    private String resolveMessage(String key, Object[] args, String fallback, Locale locale) {
        if (key == null || key.isBlank()) {
            return fallback;
        }
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            return fallback != null ? fallback : key;
        }
    }

    private String serializeArgs(String key, Object[] args) {
        if (key == null || key.isBlank() || args == null || args.length == 0) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(args);
        } catch (Exception e) {
            return null;
        }
    }

    public void markRead(Long accountId, Long alarmId) {
        Alarm alarm = alarmRepository.findByAlarmIdAndRecipientAccountId(alarmId, accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        alarm.markRead(LocalDateTime.now());
    }

    public int markAllRead(Long accountId) {
        return alarmRepository.markAllRead(accountId, LocalDateTime.now());
    }

    public void deleteAlarm(Long accountId, Long alarmId) {
        long deleted = alarmRepository.deleteByAlarmIdAndRecipientAccountId(alarmId, accountId);
        if (deleted == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
    }

    public int deleteAll(Long accountId) {
        return alarmRepository.deleteAllByRecipientAccountId(accountId);
    }
}
