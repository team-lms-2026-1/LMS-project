package com.teamlms.backend.domain.mypage.service;

import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional
public class MyPageCommandService {

    private final StudentProfileRepository studentProfileRepository;
    private final S3Service s3Service;

    /**
     * 관리자: 학생 프로필 이미지 업로드
     * 
     * @param accountId 대상 학생 계정 ID
     * @param file      업로드할 이미지 파일
     * @return 업로드된 이미지 URL
     */
    public String uploadStudentProfileImage(Long accountId, MultipartFile file) {
        StudentProfile sp = studentProfileRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        try {
            // 기존 이미지가 있다면 삭제
            if (sp.getProfileImageUrl() != null && !sp.getProfileImageUrl().isBlank()) {
                deleteImageFromS3(sp.getProfileImageUrl());
            }

            // S3 업로드 (폴더명: profiles)
            String imageUrl = s3Service.upload(file, "profiles");

            sp.updateProfileImageUrl(imageUrl);
            return imageUrl;

        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }

    /**
     * 관리자: 학생 프로필 이미지 삭제
     *
     * @param accountId 대상 학생 계정 ID
     */
    public void deleteStudentProfileImage(Long accountId) {
        StudentProfile sp = studentProfileRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        if (sp.getProfileImageUrl() != null && !sp.getProfileImageUrl().isBlank()) {
            deleteImageFromS3(sp.getProfileImageUrl());
            sp.updateProfileImageUrl(null);
        }
    }

    private void deleteImageFromS3(String imageUrl) {
        // URL에서 Key 추출
        int index = imageUrl.indexOf("profiles/");
        if (index != -1) {
            String key = imageUrl.substring(index);
            // URL Decoding이 필요할 수도 있지만, 일단 그대로 시도
            s3Service.delete(key);
        }
    }
}
