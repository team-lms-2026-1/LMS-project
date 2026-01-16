package com.teamlms.backend.domain.community.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FileType {
    IMAGE("이미지"),
    DOCUMENT("문서"),
    VIDEO("영상"),
    ETC("기타");

    private final String description;

    // MIME Type을 기반으로 FileType을 찾는 로직 (Service에서 사용 가능)
    public static FileType fromContentType(String contentType) {
        if (contentType == null) return ETC;
        
        if (contentType.startsWith("image")) {
            return IMAGE;
        } else if (contentType.contains("pdf") || contentType.contains("word") || contentType.contains("hwp")) {
            return DOCUMENT;
        } else if (contentType.startsWith("video")) {
            return VIDEO;
        }
        return ETC;
    }
}