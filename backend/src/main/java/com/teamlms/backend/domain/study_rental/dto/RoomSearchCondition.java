package com.teamlms.backend.domain.study_rental.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

// 1. 룸 검색 조건 (핵심 로직용)
@Getter
@Builder
public class RoomSearchCondition {
    private Long spaceId;
    
    private LocalDate date;      // "이 날짜에 이용 가능한 방"
    private LocalTime startTime; // "이 시간에 이용 가능한 방"
    private LocalTime endTime;
    
    private Integer peopleCount; // "N명 수용 가능한 방"
    
    private Boolean isActiveOnly;
}