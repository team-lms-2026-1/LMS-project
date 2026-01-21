package com.teamlms.backend.domain.log.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * excel_download_log (Append-only)
 * - 엑셀 다운로드 "사유" 감사 로그
 * - 최소 컬럼: actor/resource_code/reason/filter_json/downloaded_at
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "excel_download_log")
public class ExcelDownloadLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "download_log_id")
    private Long downloadLogId;

    @Column(name = "actor_account_id", nullable = false)
    private Long actorAccountId;

    @Column(name = "resource_code", nullable = false, length = 50)
    private String resourceCode; // 예: ACCESS_LOG, LOGIN_LOG ...

    @Column(name = "reason", nullable = false, columnDefinition = "text")
    private String reason;

    @Column(name = "filter_json", nullable = false, columnDefinition = "text")
    private String filterJson;

    @Column(name = "downloaded_at", nullable = false)
    private LocalDateTime downloadedAt;
}
