package com.teamlms.backend.domain.alarm.api.dto;

import com.teamlms.backend.domain.alarm.entity.Alarm;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AlarmResponse {
    private Long alarmId;
    private AlarmType type;
    private String title;
    private String message;
    private String linkUrl;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private Long actorAccountId;

    public static AlarmResponse from(Alarm alarm) {
        return AlarmResponse.builder()
                .alarmId(alarm.getAlarmId())
                .type(alarm.getType())
                .title(alarm.getTitle())
                .message(alarm.getMessage())
                .linkUrl(alarm.getLinkUrl())
                .read(alarm.isRead())
                .readAt(alarm.getReadAt())
                .createdAt(alarm.getCreatedAt())
                .actorAccountId(alarm.getCreatedBy())
                .build();
    }

    public static AlarmResponse of(Alarm alarm, String title, String message) {
        return AlarmResponse.builder()
                .alarmId(alarm.getAlarmId())
                .type(alarm.getType())
                .title(title)
                .message(message)
                .linkUrl(alarm.getLinkUrl())
                .read(alarm.isRead())
                .readAt(alarm.getReadAt())
                .createdAt(alarm.getCreatedAt())
                .actorAccountId(alarm.getCreatedBy())
                .build();
    }
}
