package com.teamlms.backend.domain.alarm.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamlms.backend.domain.alarm.api.dto.AlarmResponse;
import com.teamlms.backend.domain.alarm.entity.Alarm;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.repository.AlarmRepository;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AlarmQueryServiceTest {

    @InjectMocks
    private AlarmQueryService alarmQueryService;

    @Mock
    private AlarmRepository alarmRepository;

    @Mock
    private MessageSource messageSource;

    @Mock
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("나의 알림 목록 페이징 조회 성공")
    void getMyAlarms_Success() throws JsonProcessingException {
        // given
        Long accountId = 1L;
        Pageable pageable = PageRequest.of(0, 10);

        Alarm alarm1 = Alarm.builder()
                .recipientAccountId(accountId)
                .type(AlarmType.QNA_NEW_QUESTION)
                .title("기본 제목")
                .message("기본 내용")
                .linkUrl("/qna")
                .build();
        ReflectionTestUtils.setField(alarm1, "alarmId", 101L);

        Alarm alarm2 = Alarm.builder()
                .recipientAccountId(accountId)
                .titleKey("alarm.title")
                .messageKey("alarm.msg")
                .messageArgs("[]")
                .type(AlarmType.QNA_COMMENT)
                .build();
        ReflectionTestUtils.setField(alarm2, "alarmId", 102L);

        Page<Alarm> alarmPage = new PageImpl<>(List.of(alarm1, alarm2), pageable, 2);

        when(alarmRepository.findByRecipientAccountId(accountId, pageable)).thenReturn(alarmPage);

        // I18n resolving mocking for alarm2
        when(objectMapper.readValue("[]", Object[].class)).thenReturn(new Object[0]);
        when(messageSource.getMessage(eq("alarm.title"), isNull(), any(Locale.class))).thenReturn("다국어 제목");
        when(messageSource.getMessage(eq("alarm.msg"), any(Object[].class), any(Locale.class))).thenReturn("다국어 내용");

        // when
        Page<AlarmResponse> result = alarmQueryService.getMyAlarms(accountId, pageable);

        // then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());

        List<AlarmResponse> responses = result.getContent();

        // alarm1: basic title/message
        assertEquals(101L, responses.get(0).getAlarmId());
        assertEquals("기본 제목", responses.get(0).getTitle());
        assertEquals("기본 내용", responses.get(0).getMessage());

        // alarm2: resolved title/message
        assertEquals(102L, responses.get(1).getAlarmId());
        assertEquals("다국어 제목", responses.get(1).getTitle());
        assertEquals("다국어 내용", responses.get(1).getMessage());
    }

    @Test
    @DisplayName("읽지 않은 알림 개수 조회 성공")
    void getUnreadCount_Success() {
        // given
        Long accountId = 1L;
        when(alarmRepository.countByRecipientAccountIdAndReadAtIsNull(accountId)).thenReturn(13L);

        // when
        long count = alarmQueryService.getUnreadCount(accountId);

        // then
        assertEquals(13L, count);
        verify(alarmRepository, times(1)).countByRecipientAccountIdAndReadAtIsNull(accountId);
    }
}
