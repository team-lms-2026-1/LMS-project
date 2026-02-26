package com.teamlms.backend.domain.mypage.service;

import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.s3.S3Service;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MyPageCommandServiceTest {

    @InjectMocks
    private MyPageCommandService myPageCommandService;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private S3Service s3Service;

    @Test
    @DisplayName("학생 프로필 이미지 업로드 성공 - 기존 이미지 없음")
    void uploadStudentProfileImage_Success_NoExistingImage() throws IOException {
        // given
        Long accountId = 1L;
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test content".getBytes());
        StudentProfile sp = StudentProfile.builder().accountId(accountId).build();

        when(studentProfileRepository.findById(accountId)).thenReturn(Optional.of(sp));
        when(s3Service.upload(any(), anyString())).thenReturn("http://s3.url/profiles/new-image.jpg");

        // when
        String result = myPageCommandService.uploadStudentProfileImage(accountId, file);

        // then
        assertEquals("http://s3.url/profiles/new-image.jpg", result);
        assertEquals("http://s3.url/profiles/new-image.jpg", sp.getProfileImageUrl());
        verify(s3Service, never()).delete(anyString());
        verify(s3Service).upload(file, "profiles");
    }

    @Test
    @DisplayName("학생 프로필 이미지 업로드 성공 - 기존 이미지 존재")
    void uploadStudentProfileImage_Success_WithExistingImage() throws IOException {
        // given
        Long accountId = 1L;
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test content".getBytes());
        StudentProfile sp = StudentProfile.builder()
                .accountId(accountId)
                .profileImageUrl("http://s3.url/profiles/old-image.jpg")
                .build();

        when(studentProfileRepository.findById(accountId)).thenReturn(Optional.of(sp));
        when(s3Service.upload(any(), anyString())).thenReturn("http://s3.url/profiles/new-image.jpg");

        // when
        String result = myPageCommandService.uploadStudentProfileImage(accountId, file);

        // then
        assertEquals("http://s3.url/profiles/new-image.jpg", result);
        verify(s3Service).delete("profiles/old-image.jpg");
        verify(s3Service).upload(file, "profiles");
    }

    @Test
    @DisplayName("학생 프로필 이미지 업로드 실패 - 계정 없음")
    void uploadStudentProfileImage_Fail_AccountNotFound() {
        // given
        Long accountId = 1L;
        when(studentProfileRepository.findById(accountId)).thenReturn(Optional.empty());

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> myPageCommandService.uploadStudentProfileImage(accountId, null));
        assertEquals(ErrorCode.ACCOUNT_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("학생 프로필 이미지 업로드 실패 - 파일 업로드 오류")
    void uploadStudentProfileImage_Fail_S3Error() throws IOException {
        // given
        Long accountId = 1L;
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test content".getBytes());
        StudentProfile sp = StudentProfile.builder().accountId(accountId).build();

        when(studentProfileRepository.findById(accountId)).thenReturn(Optional.of(sp));
        when(s3Service.upload(any(), anyString())).thenThrow(new IOException());

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> myPageCommandService.uploadStudentProfileImage(accountId, file));
        assertEquals(ErrorCode.FILE_UPLOAD_ERROR, ex.getErrorCode());
    }

    @Test
    @DisplayName("학생 프로필 이미지 삭제 성공")
    void deleteStudentProfileImage_Success() {
        // given
        Long accountId = 1L;
        StudentProfile sp = StudentProfile.builder()
                .accountId(accountId)
                .profileImageUrl("http://s3.url/profiles/old-image.jpg")
                .build();

        when(studentProfileRepository.findById(accountId)).thenReturn(Optional.of(sp));

        // when
        myPageCommandService.deleteStudentProfileImage(accountId);

        // then
        assertNull(sp.getProfileImageUrl());
        verify(s3Service).delete("profiles/old-image.jpg");
    }
}
