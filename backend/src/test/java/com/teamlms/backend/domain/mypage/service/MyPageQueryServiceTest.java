package com.teamlms.backend.domain.mypage.service;

import com.teamlms.backend.domain.mypage.api.dto.StudentMypageResponse;
import com.teamlms.backend.domain.mypage.entity.StudentMypageSummary;
import com.teamlms.backend.domain.mypage.repository.MyPageTimetableRepository;
import com.teamlms.backend.domain.mypage.repository.StudentMypageSummaryRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.s3.S3Service;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MyPageQueryServiceTest {

    @InjectMocks
    private MyPageQueryService myPageQueryService;

    @Mock
    private StudentMypageSummaryRepository studentMypageSummaryRepository;

    @Mock
    private S3Service s3Service;

    @Mock
    private MyPageTimetableRepository myPageTimetableRepository;

    @Test
    @DisplayName("학생 마이페이지 조회 성공")
    void getStudentMyPage_Success() {
        // given
        Long accountId = 1L;
        StudentMypageSummary summary = StudentMypageSummary.builder()
                .accountId(accountId)
                .studentNo("20240001")
                .studentName("테스트")
                .profileImageUrl("http://s3.url/profiles/test.jpg")
                .build();

        when(studentMypageSummaryRepository.findByAccountId(accountId)).thenReturn(Optional.of(summary));
        when(s3Service.createPresignedGetUrl(anyString())).thenReturn("http://presigned.url/profiles/test.jpg");
        when(myPageTimetableRepository.findCurrentTimetable(accountId)).thenReturn(Collections.emptyList());

        // when
        StudentMypageResponse response = myPageQueryService.getStudentMyPage(accountId, null, null);

        // then
        assertEquals("테스트", response.studentName());
        assertEquals("http://presigned.url/profiles/test.jpg", response.profileImageUrl());
        verify(myPageTimetableRepository).findCurrentTimetable(accountId);
    }

    @Test
    @DisplayName("학생 마이페이지 조회 실패 - 프로필 없음")
    void getStudentMyPage_Fail_NotFound() {
        // given
        Long accountId = 1L;
        when(studentMypageSummaryRepository.findByAccountId(accountId)).thenReturn(Optional.empty());

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> myPageQueryService.getStudentMyPage(accountId, null, null));
        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("프로필 이미지 URL 조회 성공 (Presigned)")
    void getStudentProfileImageUrl_Success() {
        // given
        Long accountId = 1L;
        StudentMypageSummary summary = StudentMypageSummary.builder()
                .accountId(accountId)
                .profileImageUrl("http://s3.url/profiles/test.jpg")
                .build();

        when(studentMypageSummaryRepository.findByAccountId(accountId)).thenReturn(Optional.of(summary));
        when(s3Service.createPresignedGetUrl(anyString())).thenReturn("http://presigned.url/profiles/test.jpg");

        // when
        String result = myPageQueryService.getStudentProfileImageUrl(accountId);

        // then
        assertEquals("http://presigned.url/profiles/test.jpg", result);
        verify(s3Service).createPresignedGetUrl("profiles/test.jpg");
    }
}
