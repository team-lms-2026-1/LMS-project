package com.teamlms.backend.domain.community.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NoticeStatus {
    SCHEDULED("예약 게시"), // 시작일이 아직 안 됨
    ONGOING("게시 중"),    // 현재 게시 중
    ENDED("게시 종료");    // 종료일이 지남

    private final String description;
}