package com.teamlms.backend.domain.alarm.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AlarmUnreadCountResponse {
    private long unreadCount;
}
