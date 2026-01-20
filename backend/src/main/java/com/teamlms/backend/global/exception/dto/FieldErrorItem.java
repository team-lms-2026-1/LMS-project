package com.teamlms.backend.global.exception.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FieldErrorItem {
    private final String field;
    private final String reason;

    public static FieldErrorItem of(String field, String reason) {
        return new FieldErrorItem(field, reason);
    }
}
