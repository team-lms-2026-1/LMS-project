package com.teamlms.backend.global.s3;

import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Template s3Template;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    public String upload(MultipartFile file, String dirName) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String key = dirName + "/" + UUID.randomUUID() + "_" + originalFilename;

        // S3Template이 InputStream 관리를 자동으로 처리해줍니다.
        s3Template.upload(bucket, key, file.getInputStream());

        // 업로드된 파일의 URL 반환
        return s3Template.download(bucket, key).getURL().toString();
    }
    
    public void delete(String key) {
        // key는 전체 URL이 아니라 "notices/파일명.jpg" 형태여야 함
        s3Template.deleteObject(bucket, key);
    }
}