package com.teamlms.backend.domain.log.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * account_access_log (Append-only)
 * - 감사/사고 추적용 접근 이력
 * - insert-only (update 없음)
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "account_access_log")
public class AccountAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "accessed_at", nullable = false)
    private LocalDateTime accessedAt;

    @Column(name = "access_url", nullable = false, length = 255)
    private String accessUrl;

    @Column(name = "ip", nullable = false, length = 50)
    private String ip;

    @Column(name = "os", length = 50)
    private String os;

    @Column(name = "user_agent", length = 255)
    private String userAgent;
}
