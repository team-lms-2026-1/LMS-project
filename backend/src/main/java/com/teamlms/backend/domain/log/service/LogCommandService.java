package com.teamlms.backend.domain.log.service;

import com.teamlms.backend.domain.log.entity.AccountAccessLog;
import com.teamlms.backend.domain.log.entity.ExcelDownloadLog;
import com.teamlms.backend.domain.log.repository.AccountAccessLogRepository;
import com.teamlms.backend.domain.log.repository.ExcelDownloadLogRepository;
import com.teamlms.backend.domain.log.repository.UserActivityRepository;
import com.teamlms.backend.global.logging.util.RequestInfoExtractor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 로그 저장(쓰기) 로직 중앙집중 서비스
 * - Interceptor/유스케이스 서비스는 "언제 남길지"만 판단하고,
 * - 실제 DB 쓰기 규칙은 여기로 모음
 */
@Service
@RequiredArgsConstructor
@Transactional
public class LogCommandService {

    private final UserActivityRepository userActivityRepository;
    private final AccountAccessLogRepository accountAccessLogRepository;
    private final ExcelDownloadLogRepository excelDownloadLogRepository;

    /**
     * user_activity upsert
     * - 인증된 요청마다 호출되는 스냅샷 갱신
     */
    public void upsertUserActivity(Long accountId, HttpServletRequest request) {
        LocalDateTime now = LocalDateTime.now();

        String path = truncate(RequestInfoExtractor.getRequestPath(request), 255);
        String ip = truncate(RequestInfoExtractor.getClientIp(request), 50);
        String userAgent = truncate(RequestInfoExtractor.getUserAgent(request), 255);

        userActivityRepository.upsert(accountId, now, path, ip, userAgent);
    }

    /**
     * account_access_log insert (append-only)
     * - 정책 대상 요청만 Interceptor가 골라서 호출
     */
    public void saveAccountAccessLog(Long accountId, HttpServletRequest request, HttpServletResponse response) {
        LocalDateTime now = LocalDateTime.now();

        String path = RequestInfoExtractor.getRequestPath(request);
        String qs = RequestInfoExtractor.getQueryString(request);
        String accessUrlRaw = (qs == null || qs.isBlank()) ? path : path + "?" + qs;
        String accessUrl = truncate(accessUrlRaw, 255);

        String ip = truncate(RequestInfoExtractor.getClientIp(request), 50);
        String userAgent = truncate(RequestInfoExtractor.getUserAgent(request), 255);
        String os = truncate(parseOs(userAgent), 50);

        AccountAccessLog log = AccountAccessLog.builder()
                .accountId(accountId)
                .accessedAt(now)
                .accessUrl(accessUrl)
                .ip(ip)
                .userAgent(userAgent)
                .os(os)
                .build();

        accountAccessLogRepository.save(log);
    }

    private String parseOs(String userAgent) {
        if (userAgent == null)
            return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("windows"))
            return "Windows";
        if (ua.contains("mac os"))
            return "macOS";
        if (ua.contains("linux"))
            return "Linux";
        if (ua.contains("android"))
            return "Android";
        if (ua.contains("iphone") || ua.contains("ipad"))
            return "iOS";

        // 디버깅용: 감지 실패 시 UA 앞부분 일부 표시
        String snippet = userAgent.length() > 20 ? userAgent.substring(0, 20) : userAgent;
        return "Other (" + snippet + ")";
    }

    private String truncate(String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            return value.substring(0, maxLength);
        }
        return value;
    }

    /**
     * excel_download_log insert (append-only)
     * - 엑셀 다운로드 유스케이스 서비스에서 호출(사유/조건 포함)
     */
    public void saveExcelDownloadLog(Long actorAccountId, String resourceCode, String reason, String filterJson) {
        LocalDateTime now = LocalDateTime.now();

        ExcelDownloadLog log = ExcelDownloadLog.builder()
                .actorAccountId(actorAccountId)
                .resourceCode(resourceCode)
                .reason(reason)
                .filterJson(filterJson)
                .downloadedAt(now)
                .build();

        excelDownloadLogRepository.save(log);
    }
}
