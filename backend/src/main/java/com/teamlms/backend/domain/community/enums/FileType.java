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
        } // [수정] mp4 등 구체적인 비디오 포맷 명시 추가
        else if (contentType.startsWith("video") || contentType.contains("mp4") || contentType.contains("avi") || contentType.contains("mov") || contentType.contains("quicktime") || contentType.contains("wmv")) {
            return VIDEO;
        }
        
        return ETC;
    }
}