package com.teamlms.backend.domain.extracurricular.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
@RequiredArgsConstructor
public class S3ExtraSessionVideoPreviewUrlService implements ExtraSessionVideoPreviewUrlService {

    private final S3Presigner presigner;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    /**
     * 관리자 상세 페이지에서 <video src="..."> 로 바로 재생 가능한 presigned GET URL 생성.
     * - 만료: 5분(300초)
     * - Content-Type: video/mp4 로 응답 강제 (브라우저 호환성 목적)
     */
    @Override
    public String createPreviewUrl(String storageKey) {

        if (storageKey == null || storageKey.isBlank()) {
            // 여기서 VALIDATION_ERROR 써도 되고, NOT_FOUND로 통일해도 됨
            throw new IllegalArgumentException("storageKey is blank");
        }

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
            .bucket(bucket)
            .key(storageKey.trim())
            // 브라우저에서 영상으로 잘 인식하도록 (필요 없으면 제거 가능)
            .responseContentType("video/mp4")
            // 다운로드가 아니라 스트리밍/미리보기 성격이면 inline 권장
            .responseContentDisposition("inline")
            .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(5))
            .getObjectRequest(getObjectRequest)
            .build();

        return presigner.presignGetObject(presignRequest).url().toString();
    }
}
