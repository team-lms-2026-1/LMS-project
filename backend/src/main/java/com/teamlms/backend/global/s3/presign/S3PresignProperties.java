// src/main/java/com/teamlms/backend/global/s3/presign/S3PresignProperties.java
package com.teamlms.backend.global.s3.presign;

import org.springframework.boot.context.properties.ConfigurationProperties;

// 예: src/main/java/.../S3PresignProperties.java
@ConfigurationProperties(prefix = "app.s3.presign")
@org.springframework.validation.annotation.Validated
public record S3PresignProperties(
    @jakarta.validation.constraints.Min(1) int putExpiresSeconds,
    String keyPrefix
) {
    public String resolvedKeyPrefix() {
        return keyPrefix == null ? "" : keyPrefix.replaceAll("/+$", "");
    }
}
