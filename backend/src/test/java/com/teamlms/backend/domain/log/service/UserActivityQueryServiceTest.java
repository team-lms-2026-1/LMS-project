package com.teamlms.backend.domain.log.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
// import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
// import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.log.api.dto.UserAccessLogDetailResponse;
import com.teamlms.backend.domain.log.api.dto.UserActivityListItem;
import com.teamlms.backend.domain.log.api.dto.UserActivitySummary;
import com.teamlms.backend.domain.log.repository.AccountAccessLogRepository;
import com.teamlms.backend.domain.log.repository.UserActivityListRepository;
import com.teamlms.backend.domain.log.repository.projection.AccountAccessLogRow;
import com.teamlms.backend.domain.log.repository.projection.UserActivityRow;
import com.teamlms.backend.domain.log.repository.projection.UserActivitySummaryRow;
import com.teamlms.backend.domain.log.repository.projection.UserHeaderRow;
import com.teamlms.backend.domain.log.service.UserActivityQueryService.AccessLogDetailResult;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@ExtendWith(MockitoExtension.class)
class UserActivityQueryServiceTest {

    @InjectMocks
    private UserActivityQueryService userActivityQueryService;

    @Mock
    private UserActivityListRepository userActivityListRepository;

    @Mock
    private AccountAccessLogRepository accountAccessLogRepository;

    @Test
    @DisplayName("사용자 접속자 리스트 조회")
    void list_Success() {
        // given
        String keyword = "test";
        Pageable pageable = PageRequest.of(0, 10);

        UserActivityRow mockRow = mock(UserActivityRow.class);
        when(mockRow.getAccountId()).thenReturn(1L);
        when(mockRow.getLoginId()).thenReturn("user01");
        when(mockRow.getAccountType()).thenReturn("STUDENT");
        when(mockRow.getName()).thenReturn("Hong Gil Dong");
        when(mockRow.getLastActivityAt()).thenReturn(LocalDateTime.now());
        when(mockRow.getIsOnline()).thenReturn(true);

        Page<UserActivityRow> mockPage = new PageImpl<>(List.of(mockRow), pageable, 1);
        when(userActivityListRepository.findUserActivityRows(eq(keyword), eq(pageable))).thenReturn(mockPage);

        // when
        Page<UserActivityListItem> result = userActivityQueryService.list(keyword, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("user01", result.getContent().get(0).loginId());
        assertTrue(result.getContent().get(0).isOnline());
    }

    @Test
    @DisplayName("계정 요약 조회")
    void summary_Success() {
        // given
        String keyword = "test";
        UserActivitySummaryRow summaryRow = mock(UserActivitySummaryRow.class);
        when(summaryRow.getTotalAccounts()).thenReturn(100L);
        when(summaryRow.getOnlineAccounts()).thenReturn(20L);

        when(userActivityListRepository.findSummary(eq(keyword))).thenReturn(summaryRow);

        // when
        UserActivitySummary result = userActivityQueryService.summary(keyword);

        // then
        assertNotNull(result);
        assertEquals(100L, result.totalAccounts());
        assertEquals(20L, result.onlineAccounts());
    }

    @Test
    @DisplayName("상세 접속 로그 조회 성공")
    void accessLogsDetail_Success() {
        // given
        Long accountId = 1L;
        LocalDate from = LocalDate.of(2024, 1, 1);
        LocalDate to = LocalDate.of(2024, 1, 31);
        String keyword = "login";
        Pageable pageable = PageRequest.of(0, 10);

        UserHeaderRow headerRow = mock(UserHeaderRow.class);
        when(headerRow.getAccountId()).thenReturn(accountId);
        when(headerRow.getLoginId()).thenReturn("user01");
        when(headerRow.getAccountType()).thenReturn("STUDENT");
        when(headerRow.getName()).thenReturn("Hong Gil Dong");

        when(userActivityListRepository.findHeaderByAccountId(accountId)).thenReturn(Optional.of(headerRow));
        when(userActivityListRepository.findDepartmentNameByAccountId(accountId))
                .thenReturn(Optional.of("Computer Science"));

        AccountAccessLogRow logRow = mock(AccountAccessLogRow.class);
        when(logRow.getLogId()).thenReturn(100L);
        when(logRow.getAccessedAt()).thenReturn(LocalDateTime.now());
        when(logRow.getAccessUrl()).thenReturn("/api/login");
        when(logRow.getIp()).thenReturn("127.0.0.1");
        when(logRow.getOs()).thenReturn("Windows");

        Page<AccountAccessLogRow> mockPage = new PageImpl<>(List.of(logRow), pageable, 1);
        when(accountAccessLogRepository.findPageByAccountId(
                eq(accountId),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                eq(keyword),
                eq(pageable)))
                .thenReturn(mockPage);

        // when
        AccessLogDetailResult result = userActivityQueryService.accessLogsDetail(accountId, from, to, keyword,
                pageable);

        // then
        assertNotNull(result);
        assertNotNull(result.data());
        assertNotNull(result.page());

        UserAccessLogDetailResponse.Header header = result.data().header();
        assertEquals("user01", header.loginId());
        assertEquals("Computer Science", header.departmentName());

        List<UserAccessLogDetailResponse.Item> items = result.data().items();
        assertEquals(1, items.size());
        assertEquals("/api/login", items.get(0).accessUrl());
    }

    @Test
    @DisplayName("상세 접속 로그 조회 실패 - 사용자 찾을 수 없음")
    void accessLogsDetail_Fail_AccountNotFound() {
        // given
        Long accountId = 999L;
        LocalDate from = LocalDate.now();
        LocalDate to = LocalDate.now();
        String keyword = "";
        Pageable pageable = PageRequest.of(0, 10);

        when(userActivityListRepository.findHeaderByAccountId(accountId)).thenReturn(Optional.empty());

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> userActivityQueryService.accessLogsDetail(accountId, from, to, keyword, pageable));
        assertEquals(ErrorCode.ACCOUNT_NOT_FOUND, exception.getErrorCode());
    }
}
