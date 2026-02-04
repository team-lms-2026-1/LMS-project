package com.teamlms.backend.domain.log.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record UserAccessLogDetailResponse(
                Header header,
                List<Item> items) {
        public record Header(
                        Long accountId,
                        String loginId,
                        String accountType,
                        String name,
                        String departmentName) {
        }

        public record Item(
                        Long logId,
                        LocalDateTime accessedAt,
                        String accessUrl,
                        String ip,
                        String os) {
        }
}
