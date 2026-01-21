package com.teamlms.backend.domain.log.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamlms.backend.domain.log.api.dto.LogExportRequest;
import com.teamlms.backend.domain.log.entity.AccountAccessLog;
import com.teamlms.backend.domain.log.repository.AccountAccessLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 로그 다운로드 유스케이스 서비스
 * - (1) 요청 검증
 * - (2) 로그 조회
 * - (3) CSV 생성
 * - (4) excel_download_log 저장(사유/조건/리소스코드)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ExcelDownloadService {

    private static final int EXPORT_LIMIT = 50_000; // 너무 큰 다운로드 방지(필요하면 조정)

    private final LogCommandService logCommandService;
    private final AccountAccessLogRepository accountAccessLogRepository;
    private final ObjectMapper objectMapper;

    public byte[] exportLogsAsCsv(Long actorAccountId, LogExportRequest req) {
        validate(req);

        // 감사 로그용: "요청 조건 그대로" 저장
        String filterJson = toJson(req.getFilter());

        // 현재는 ACCESS_LOG만 구현(원하면 LOGIN_LOG 등 추가 가능)
        List<AccountAccessLog> rows = fetchLogs(req);

        byte[] fileBytes = buildAccessLogCsv(rows);

        // 다운로드 사유 로그 저장(append-only)
        logCommandService.saveExcelDownloadLog(
                actorAccountId,
                req.getResourceCode(),
                req.getReason(),
                filterJson
        );

        return fileBytes;
    }

    private void validate(LogExportRequest req) {
        if (req.getFilter() == null) {
            throw new IllegalArgumentException("filter is required");
        }
        LocalDateTime from = req.getFilter().getFrom();
        LocalDateTime to = req.getFilter().getTo();

        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("from must be before or equal to to");
        }

        // 지금은 로그 도메인만: ACCESS_LOG만 지원
        if (!"ACCESS_LOG".equals(req.getResourceCode())) {
            throw new IllegalArgumentException("unsupported resourceCode: " + req.getResourceCode());
        }
    }

    private List<AccountAccessLog> fetchLogs(LogExportRequest req) {
        LocalDateTime from = req.getFilter().getFrom();
        LocalDateTime to = req.getFilter().getTo();
        Long targetAccountId = req.getFilter().getTargetAccountId();

        // 기간이 없으면 너무 커질 수 있어서 기본 기간을 잡아도 됨(정책 선택)
        // 여기선 "둘 다 null 가능"로 두고 전체 조회는 금지 -> 필요하면 막자.
        if (from == null && to == null) {
            throw new IllegalArgumentException("from/to is required for export (to prevent huge downloads)");
        }

        // to만 없으면 "현재"까지
        if (from != null && to == null) to = LocalDateTime.now();
        // from만 없으면 "과거 무한"이 되므로 금지(정책)
        if (from == null) {
            throw new IllegalArgumentException("from is required when to is provided");
        }

        if (targetAccountId != null) {
            return accountAccessLogRepository.findForExportByAccountId(targetAccountId, from, to, EXPORT_LIMIT);
        }
        return accountAccessLogRepository.findForExport(from, to, EXPORT_LIMIT);
    }

    private String toJson(Object filter) {
        try {
            return objectMapper.writeValueAsString(filter);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("failed to serialize filter_json", e);
        }
    }

    /**
     * Access Log CSV 생성
     * - 엑셀(xlsx)로 바꾸고 싶으면 여기만 교체하면 됨
     */
    private byte[] buildAccessLogCsv(List<AccountAccessLog> rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("logId,accountId,accessedAt,accessUrl,ip,os,userAgent\n");

        for (AccountAccessLog r : rows) {
            sb.append(n(r.getLogId())).append(',')
              .append(n(r.getAccountId())).append(',')
              .append(csv(r.getAccessedAt())).append(',')
              .append(csv(r.getAccessUrl())).append(',')
              .append(csv(r.getIp())).append(',')
              .append(csv(r.getOs())).append(',')
              .append(csv(r.getUserAgent()))
              .append('\n');
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String n(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    /**
     * CSV 안전 처리: 쉼표/개행/따옴표 포함 시 쌍따옴표로 감싸고 따옴표 이스케이프
     */
    private String csv(Object v) {
        if (v == null) return "";
        String s = String.valueOf(v);
        boolean needQuote = s.contains(",") || s.contains("\n") || s.contains("\r") || s.contains("\"");
        if (!needQuote) return s;
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}
