package com.teamlms.backend.domain.alarm.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamlms.backend.domain.alarm.entity.Alarm;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.repository.AlarmRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AlarmCommandServiceTest {

    @InjectMocks
    private AlarmCommandService alarmCommandService;

    @Mock
    private AlarmRepository alarmRepository;

    @Mock
    private MessageSource messageSource;

    @Mock
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("일반 알림 생성 성공")
    void createAlarm_Success() {
        // given
        Long recipientId = 1L;
        AlarmType type = AlarmType.QNA_NEW_QUESTION;
        String title = "새 질문";
        String message = "새로운 질문이 등록되었습니다.";
        String linkUrl = "/qna/1";

        Alarm savedAlarm = Alarm.builder().build();
        ReflectionTestUtils.setField(savedAlarm, "alarmId", 100L);

        when(alarmRepository.save(any(Alarm.class))).thenReturn(savedAlarm);

        // when
        Long alarmId = alarmCommandService.createAlarm(recipientId, type, title, message, linkUrl);

        // then
        assertEquals(100L, alarmId);
        verify(alarmRepository, times(1)).save(any(Alarm.class));
    }

    // ㅁㄴㅇㅁㄴㅇ
    @Test
    @DisplayName("다국어 알림 생성 성공 (I18n)")
    void createAlarmI18n_Success() throws JsonProcessingException {
        // given
        Long recipientId = 1L;
        AlarmType type = AlarmType.QNA_COMMENT;
        String titleKey = "alarm.title";
        String messageKey = "alarm.message";
        Object[] args = new Object[] { "Hong" };
        String linkUrl = "/qna/2";

        when(messageSource.getMessage(eq(titleKey), isNull(), any(), any(Locale.class))).thenReturn("알림 제목");
        when(messageSource.getMessage(eq(messageKey), eq(args), any(), any(Locale.class)))
                .thenReturn("Hong 님이 등록했습니다.");
        when(objectMapper.writeValueAsString(args)).thenReturn("[\"Hong\"]");

        Alarm savedAlarm = Alarm.builder().build();
        ReflectionTestUtils.setField(savedAlarm, "alarmId", 200L);
        when(alarmRepository.save(any(Alarm.class))).thenReturn(savedAlarm);

        // when
        Long alarmId = alarmCommandService.createAlarmI18n(recipientId, type, titleKey, messageKey, args, linkUrl,
                "fallbackT", "fallbackM");

        // then
        assertEquals(200L, alarmId);
        verify(alarmRepository, times(1)).save(any(Alarm.class));
    }

    @Test
    @DisplayName("단일 알림 읽음 처리 성공")
    void markRead_Success() {
        // given
        Long accountId = 1L;
        Long alarmId = 10L;

        Alarm alarm = Alarm.builder().build();
        assertNull(alarm.getReadAt());

        when(alarmRepository.findByAlarmIdAndRecipientAccountId(alarmId, accountId))
                .thenReturn(Optional.of(alarm));

        // when
        alarmCommandService.markRead(accountId, alarmId);

        // then
        assertNotNull(alarm.getReadAt());
    }

    @Test
    @DisplayName("단일 알림 읽음 처리 실패 - 권한 없음 또는 존재하지 않음")
    void markRead_Fail_NotFound() {
        // given
        Long accountId = 1L;
        Long alarmId = 10L;

        when(alarmRepository.findByAlarmIdAndRecipientAccountId(alarmId, accountId))
                .thenReturn(Optional.empty());

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> alarmCommandService.markRead(accountId, alarmId));
        assertEquals(ErrorCode.NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("모든 알림 읽음 처리 성공")
    void markAllRead_Success() {
        // given
        Long accountId = 1L;
        when(alarmRepository.markAllRead(eq(accountId), any(LocalDateTime.class))).thenReturn(5);

        // when
        int updatedCount = alarmCommandService.markAllRead(accountId);

        // then
        assertEquals(5, updatedCount);
        verify(alarmRepository, times(1)).markAllRead(eq(accountId), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("알림 단일 삭제 성공")
    void deleteAlarm_Success() {
        // given
        Long accountId = 1L;
        Long alarmId = 10L;
        when(alarmRepository.deleteByAlarmIdAndRecipientAccountId(alarmId, accountId)).thenReturn(1L);

        // when
        assertDoesNotThrow(() -> alarmCommandService.deleteAlarm(accountId, alarmId));

        // then
        verify(alarmRepository, times(1)).deleteByAlarmIdAndRecipientAccountId(alarmId, accountId);
    }

    @Test
    @DisplayName("알림 단일 삭제 실패 - 권한 없음 또는 존재하지 않음")
    void deleteAlarm_Fail_NotFound() {
        // given
        Long accountId = 1L;
        Long alarmId = 10L;
        when(alarmRepository.deleteByAlarmIdAndRecipientAccountId(alarmId, accountId)).thenReturn(0L);

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> alarmCommandService.deleteAlarm(accountId, alarmId));
        assertEquals(ErrorCode.NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("알림 모두 삭제 성공")
    void deleteAll_Success() {
        // given
        Long accountId = 1L;
        when(alarmRepository.deleteAllByRecipientAccountId(accountId)).thenReturn(10);

        // when
        int deletedCount = alarmCommandService.deleteAll(accountId);

        // then
        assertEquals(10, deletedCount);
        verify(alarmRepository, times(1)).deleteAllByRecipientAccountId(accountId);
    }
}
