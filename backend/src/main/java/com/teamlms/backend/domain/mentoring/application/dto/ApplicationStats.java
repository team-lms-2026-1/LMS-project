package com.teamlms.backend.domain.mentoring.application.dto;

import java.util.Map;

public record ApplicationStats(Map<String, Object> MENTEE, Map<String, Object> MENTOR) {}
