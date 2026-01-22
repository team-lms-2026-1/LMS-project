package com.teamlms.backend.domain.semester.enums;

public enum Term {
    FIRST, SECOND, SUMMER, WINTER;

    public String shortCode() {
        return switch (this) {
            case FIRST -> "1";
            case SECOND -> "2";
            case SUMMER -> "s";
            case WINTER -> "w";
        };
    }
}
