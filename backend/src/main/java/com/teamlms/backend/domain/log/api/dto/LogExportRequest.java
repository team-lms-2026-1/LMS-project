package com.teamlms.backend.domain.log.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 로그 다운로드 요청 DTO (사유 1칸 + 최소 필터)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogExportRequest {

    @NotBlank
    private String resourceCode; // 현재: ACCESS_LOG 고정(추후 확장 가능)

    @NotBlank
    private String reason; // 다운로드 사유(필수)

    @Valid
    @NotNull
    private Filter filter;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Filter {
        private Long targetAccountId; // 특정 사용자 로그(옵션)

        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime from; // 시작(필수로 운영하는 걸 추천)

        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime to; // 종료(없으면 now로 보정)
    }
}
