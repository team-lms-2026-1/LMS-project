package com.teamlms.backend.global.api;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private final T data;
    private final Object meta;

    /** meta가 필요 없는 일반 응답 */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, new Meta());
    }

    /** meta를 직접 넣고 싶을 때(페이징 등) */
    public static <T> ApiResponse<T> ok(T data, Object meta) {
        return new ApiResponse<>(data, meta);
    }

    @Getter
    public static class Meta {
        private String requestId; // 옵션 (없으면 null)
    }
}
