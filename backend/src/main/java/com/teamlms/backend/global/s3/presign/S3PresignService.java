// src/main/java/com/teamlms/backend/global/s3/presign/S3PresignService.java
package com.teamlms.backend.global.s3.presign;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Service
@RequiredArgsConstructor
public class S3PresignService {

    private final S3Presigner presigner;
    private final S3PresignProperties props;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    public PresignPutResult presignPutExtraSessionVideo(Long extraOfferingId, String contentType) {
        String normalizedContentType = contentType == null ? "" : contentType.trim().toLowerCase();

        String ext = switch (normalizedContentType) {
            case "video/mp4" -> "mp4";
            case "video/quicktime" -> "mov";
            default -> "bin";
        };

        String storageKey = props.resolvedKeyPrefix()
            + "/offering-" + extraOfferingId
            + "/" + UUID.randomUUID()
            + "." + ext;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(bucket) // ✅ props.bucket() 대신 spring.cloud.aws.s3.bucket 사용
            .key(storageKey)
            .contentType(normalizedContentType.isBlank() ? null : normalizedContentType)
            .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofSeconds(props.putExpiresSeconds()))
            .putObjectRequest(putObjectRequest)
            .build();

        var presigned = presigner.presignPutObject(presignRequest);

        LocalDateTime expiresAt = LocalDateTime.ofInstant(
            java.time.Instant.now().plusSeconds(props.putExpiresSeconds()),
            ZoneOffset.UTC
        );

        Map<String, String> requiredHeaders =
            normalizedContentType.isBlank() ? Map.of() : Map.of("Content-Type", normalizedContentType);

        return new PresignPutResult(storageKey, presigned.url().toString(), expiresAt, requiredHeaders);
    }

    public record PresignPutResult(
        String storageKey,
        String uploadUrl,
        LocalDateTime expiresAt,
        Map<String, String> requiredHeaders
    ) {}
}
