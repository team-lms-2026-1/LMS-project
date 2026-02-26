package com.teamlms.backend.domain.log.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;

import com.teamlms.backend.domain.log.repository.AccountAccessLogRepository;
import com.teamlms.backend.domain.log.repository.ExcelDownloadLogRepository;
import com.teamlms.backend.domain.log.repository.UserActivityRepository;

import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class LogCommandServiceTest {

    @InjectMocks
    private LogCommandService logCommandService;

    @Mock
    private UserActivityRepository userActivityRepository;

    @Mock
    private AccountAccessLogRepository accountAccessLogRepository;

    @Mock
    private ExcelDownloadLogRepository excelDownloadLogRepository;

    @Test
    @DisplayName("UserActivity Upsert 성공")
    void upsertUserActivity_Success() {
        // given
        Long accountId = 1L;
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");
        request.addHeader("X-Forwarded-For", "127.0.0.1");
        request.addHeader("User-Agent", "TestAgent");

        // when
        logCommandService.upsertUserActivity(accountId, request);

        // then
        verify(userActivityRepository).upsert(
                eq(accountId),
                any(LocalDateTime.class),
                eq("/api/test"),
                eq("127.0.0.1"),
                eq("TestAgent"));
    }

    @Test
    @DisplayName("AccountAccessLog 저장 성공")
    void saveAccountAccessLog_Success() {
        // given
        Long accountId = 1L;
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");
        request.setQueryString("param1=value1");
        request.addHeader("X-Forwarded-For", "192.168.0.1");
        request.addHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        HttpServletResponse response = mock(HttpServletResponse.class);

        // when
        logCommandService.saveAccountAccessLog(accountId, request, response);

        // then
        verify(accountAccessLogRepository).save(argThat(log -> log.getAccountId().equals(accountId) &&
                log.getAccessUrl().equals("/api/test?param1=value1") &&
                log.getIp().equals("192.168.0.1") &&
                log.getUserAgent().contains("Mozilla/5.0") &&
                log.getOs().equals("Windows")));
    }

    @Test
    @DisplayName("OS 파싱 로직 성공 확인 - Mac")
    void saveAccountAccessLog_OSParsing_Mac() {
        // given
        Long accountId = 1L;
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
        HttpServletResponse response = mock(HttpServletResponse.class);

        // when
        logCommandService.saveAccountAccessLog(accountId, request, response);

        // then
        verify(accountAccessLogRepository).save(argThat(log -> log.getOs().equals("macOS")));
    }

    @Test
    @DisplayName("ExcelDownloadLog 저장 성공")
    void saveExcelDownloadLog_Success() {
        // given
        Long actorAccountId = 1L;
        String resourceCode = "ACCESS_LOG";
        String reason = "Test Download";
        String filterJson = "{\"test\": \"json\"}";

        // when
        logCommandService.saveExcelDownloadLog(actorAccountId, resourceCode, reason, filterJson);

        // then
        verify(excelDownloadLogRepository).save(argThat(log -> log.getActorAccountId().equals(actorAccountId) &&
                log.getResourceCode().equals(resourceCode) &&
                log.getReason().equals(reason) &&
                log.getFilterJson().equals(filterJson) &&
                log.getDownloadedAt() != null));
    }
}
