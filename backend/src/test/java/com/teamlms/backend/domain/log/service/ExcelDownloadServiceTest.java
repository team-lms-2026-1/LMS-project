package com.teamlms.backend.domain.log.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamlms.backend.domain.log.api.dto.LogExportRequest;
import com.teamlms.backend.domain.log.entity.AccountAccessLog;
import com.teamlms.backend.domain.log.repository.AccountAccessLogRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ExcelDownloadServiceTest {

    @InjectMocks
    private ExcelDownloadService excelDownloadService;

    @Mock
    private LogCommandService logCommandService;

    @Mock
    private AccountAccessLogRepository accountAccessLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("로그 엑셀(CSV) 다운로드 성공 - 타겟 AccountId 지정")
    void exportLogsAsCsv_Success_WithTargetAccountId() throws Exception {
        // given
        Long actorAccountId = 1L;
        Long targetAccountId = 2L;
        LocalDateTime from = LocalDateTime.of(2024, 1, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(2024, 1, 31, 23, 59);

        LogExportRequest.Filter filter = LogExportRequest.Filter.builder()
                .targetAccountId(targetAccountId)
                .from(from)
                .to(to)
                .build();

        LogExportRequest request = LogExportRequest.builder()
                .resourceCode("ACCESS_LOG")
                .reason("감사 용도")
                .filter(filter)
                .build();

        AccountAccessLog log1 = AccountAccessLog.builder()
                .accountId(targetAccountId)
                .accessedAt(LocalDateTime.now())
                .accessUrl("/api/test1")
                .ip("127.0.0.1")
                .os("Windows")
                .userAgent("Mozilla")
                .build();

        List<AccountAccessLog> mockLogs = List.of(log1);
        when(accountAccessLogRepository.findForExportByAccountId(eq(targetAccountId), eq(from), eq(to), anyInt()))
                .thenReturn(mockLogs);

        when(objectMapper.writeValueAsString(any()))
                .thenReturn("{\"from\":\"2024-01-01T00:00:00\",\"to\":\"2024-01-31T23:59:00\"}");

        // when
        byte[] csvBytes = excelDownloadService.exportLogsAsCsv(actorAccountId, request);

        // then
        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 0);

        String csvString = new String(csvBytes);
        assertTrue(csvString.contains("logId,accountId,accessedAt,accessUrl,ip,os,userAgent"));
        assertTrue(csvString.contains("/api/test1"));

        verify(logCommandService).saveExcelDownloadLog(eq(actorAccountId), eq("ACCESS_LOG"), eq("감사 용도"), anyString());
    }

    @Test
    @DisplayName("로그 엑셀(CSV) 다운로드 성공 - 전체 조회")
    void exportLogsAsCsv_Success_AllAccounts() throws Exception {
        // given
        Long actorAccountId = 1L;
        LocalDateTime from = LocalDateTime.now().minusDays(1);
        LocalDateTime to = LocalDateTime.now();

        LogExportRequest.Filter filter = LogExportRequest.Filter.builder()
                .from(from)
                .to(to)
                .build();

        LogExportRequest request = LogExportRequest.builder()
                .resourceCode("ACCESS_LOG")
                .reason("정기 감사")
                .filter(filter)
                .build();

        AccountAccessLog log2 = AccountAccessLog.builder()
                .accountId(10L)
                .accessedAt(LocalDateTime.now())
                .accessUrl("/api/test2")
                .ip("192.168.0.1")
                .os("macOS")
                .userAgent("Safari")
                .build();

        List<AccountAccessLog> mockLogs = List.of(log2);
        when(accountAccessLogRepository.findForExport(eq(from), eq(to), anyInt())).thenReturn(mockLogs);
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        // when
        byte[] csvBytes = excelDownloadService.exportLogsAsCsv(actorAccountId, request);

        // then
        assertNotNull(csvBytes);
        verify(accountAccessLogRepository).findForExport(eq(from), eq(to), anyInt());
        verify(logCommandService).saveExcelDownloadLog(eq(actorAccountId), eq("ACCESS_LOG"), eq("정기 감사"), anyString());
    }

    @Test
    @DisplayName("로그 엑셀(CSV) 다운로드 실패 - 필터 누락")
    void exportLogsAsCsv_Fail_FilterRequired() {
        // given
        Long actorAccountId = 1L;
        LogExportRequest request = LogExportRequest.builder()
                .resourceCode("ACCESS_LOG")
                .reason("사유")
                .filter(null)
                .build();

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> excelDownloadService.exportLogsAsCsv(actorAccountId, request));
        assertEquals(ErrorCode.LOG_EXPORT_FILTER_REQUIRED, exception.getErrorCode());
    }

    @Test
    @DisplayName("로그 엑셀(CSV) 다운로드 실패 - 시작 날짜(From) 누락")
    void exportLogsAsCsv_Fail_PeriodRequired() {
        // given
        Long actorAccountId = 1L;
        LogExportRequest.Filter filter = LogExportRequest.Filter.builder()
                .to(LocalDateTime.now())
                .build();

        LogExportRequest request = LogExportRequest.builder()
                .resourceCode("ACCESS_LOG")
                .reason("사유")
                .filter(filter)
                .build();

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> excelDownloadService.exportLogsAsCsv(actorAccountId, request));
        assertEquals(ErrorCode.LOG_EXPORT_PERIOD_REQUIRED, exception.getErrorCode());
    }

    @Test
    @DisplayName("로그 엑셀(CSV) 다운로드 실패 - 지원하지 않는 자원 코드")
    void exportLogsAsCsv_Fail_UnsupportedResource() {
        // given
        Long actorAccountId = 1L;
        LogExportRequest.Filter filter = LogExportRequest.Filter.builder()
                .from(LocalDateTime.now().minusDays(1))
                .to(LocalDateTime.now())
                .build();

        LogExportRequest request = LogExportRequest.builder()
                .resourceCode("UNKNOWN_LOG")
                .reason("사유")
                .filter(filter)
                .build();

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> excelDownloadService.exportLogsAsCsv(actorAccountId, request));
        assertEquals(ErrorCode.LOG_RESOURCE_NOT_SUPPORTED, exception.getErrorCode());
    }

    @Test
    @DisplayName("로그 엑셀(CSV) 다운로드 실패 - 날짜 역전")
    void exportLogsAsCsv_Fail_InvalidDateRange() {
        // given
        Long actorAccountId = 1L;
        LocalDateTime to = LocalDateTime.now().minusDays(1);
        LocalDateTime from = LocalDateTime.now(); // from 이 to 보다 미래

        LogExportRequest.Filter filter = LogExportRequest.Filter.builder()
                .from(from)
                .to(to)
                .build();

        LogExportRequest request = LogExportRequest.builder()
                .resourceCode("ACCESS_LOG")
                .reason("사유")
                .filter(filter)
                .build();

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> excelDownloadService.exportLogsAsCsv(actorAccountId, request));
        assertEquals(ErrorCode.LOG_DATE_RANGE_INVALID, exception.getErrorCode());
    }
}
