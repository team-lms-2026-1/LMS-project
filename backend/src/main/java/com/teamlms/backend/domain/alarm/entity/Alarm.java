package com.teamlms.backend.domain.alarm.entity;

import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "alarm")
public class Alarm extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alarm_id")
    private Long alarmId;

    @Column(name = "recipient_account_id", nullable = false)
    private Long recipientAccountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "alarm_type", nullable = false, length = 50)
    private AlarmType type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public void markRead(LocalDateTime now) {
        if (this.readAt == null) {
            this.readAt = now;
        }
    }

    public boolean isRead() {
        return this.readAt != null;
    }
}
