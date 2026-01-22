package com.teamlms.backend.domain.log.api;

import com.teamlms.backend.domain.log.api.dto.LogExportRequest;
import com.teamlms.backend.domain.log.service.ExcelDownloadService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 관리자: 로그 엑셀(현재는 CSV) 다운로드 API
 * - 서비스에서 파일 생성 + excel_download_log 저장까지 처리
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/logs")
@PreAuthorize("hasAuthority('LOG_MANAGE')")
public class LogAdminController {

    private final ExcelDownloadService excelDownloadService;

    @PostMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportLogs(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody LogExportRequest request
    ) {
        Long actorAccountId = authUser.getAccountId();

        byte[] bytes = excelDownloadService.exportLogsAsCsv(actorAccountId, request);

        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "logs_" + request.getResourceCode() + "_" + ts + ".csv";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(bytes);
    }
}
