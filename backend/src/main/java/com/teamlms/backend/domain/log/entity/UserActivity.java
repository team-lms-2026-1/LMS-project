package com.teamlms.backend.domain.log.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * user_activity (Snapshot)
 * - 계정당 1행
 * - 최근 활동/온라인 여부 계산용(5분 룰 등)
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "user_activity")
public class UserActivity {

    @Id
    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "first_activity_at", nullable = false)
    private LocalDateTime firstActivityAt;

    @Column(name = "last_activity_at", nullable = false)
    private LocalDateTime lastActivityAt;

    @Column(name = "last_request_path", length = 255)
    private String lastRequestPath;

    @Column(name = "last_ip", length = 50)
    private String lastIp;

    @Column(name = "last_user_agent", length = 255)
    private String lastUserAgent;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
