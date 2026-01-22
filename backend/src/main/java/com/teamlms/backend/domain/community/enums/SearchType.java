package com.teamlms.backend.domain.community.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SearchType {
    TITLE("제목"),
    CONTENT("내용"),
    TITLE_OR_CONTENT("제목+내용"),
    WRITER("작성자");

    private final String description;
}