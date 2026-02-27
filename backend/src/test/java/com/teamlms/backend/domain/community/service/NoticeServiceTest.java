package com.teamlms.backend.domain.community.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.teamlms.backend.domain.account.entity.Account;
import org.springframework.test.util.ReflectionTestUtils;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.ExternalNoticeRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalNoticeResponse;
import com.teamlms.backend.domain.community.entity.Notice;
import com.teamlms.backend.domain.community.entity.NoticeCategory;
import com.teamlms.backend.domain.community.repository.CommunityAccountRepository;
import com.teamlms.backend.domain.community.repository.NoticeAttachmentRepository;
import com.teamlms.backend.domain.community.repository.NoticeCategoryRepository;
import com.teamlms.backend.domain.community.repository.NoticeRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.s3.S3Service;

@ExtendWith(MockitoExtension.class)
class NoticeServiceTest {

    @InjectMocks
    private NoticeService noticeService;

    @Mock
    private NoticeRepository noticeRepository;

    @Mock
    private NoticeCategoryRepository categoryRepository;

    @Mock
    private NoticeAttachmentRepository attachmentRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CommunityAccountRepository communityAccountRepository;

    @Mock
    private S3Service s3Service;

    @Test
    @DisplayName("공지사항 생성 성공")
    void createNotice_Success() {
        // given
        Long authorId = 1L;
        Long categoryId = 1L;

        Account author = mock(Account.class);
        when(accountRepository.findById(authorId)).thenReturn(Optional.of(author));

        NoticeCategory category = mock(NoticeCategory.class);
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        ExternalNoticeRequest request = new ExternalNoticeRequest();
        ReflectionTestUtils.setField(request, "categoryId", categoryId);
        ReflectionTestUtils.setField(request, "title", "Test Title");
        ReflectionTestUtils.setField(request, "content", "Test Content");

        when(noticeRepository.save(any(Notice.class))).thenAnswer(invocation -> {
            Notice notice = invocation.getArgument(0);
            ReflectionTestUtils.setField(notice, "id", 100L);
            return notice;
        });

        // when
        Long noticeId = noticeService.createNotice(request, null, authorId);

        // then
        verify(accountRepository).findById(authorId);
        verify(categoryRepository).findById(categoryId);
        verify(noticeRepository).save(any(Notice.class));
        assertNotNull(noticeId);
    }

    @Test
    @DisplayName("공지사항 생성 실패 - 카테고리 없음")
    void createNotice_Fail_CategoryNotFound() {
        // given
        Long authorId = 1L;
        Long categoryId = 999L;

        Account author = mock(Account.class);
        when(accountRepository.findById(authorId)).thenReturn(Optional.of(author));

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        ExternalNoticeRequest request = new ExternalNoticeRequest();
        ReflectionTestUtils.setField(request, "categoryId", categoryId);
        ReflectionTestUtils.setField(request, "title", "Test Title");
        ReflectionTestUtils.setField(request, "content", "Test Content");

        // when & then
        assertThrows(BusinessException.class, () -> noticeService.createNotice(request, null, authorId));

        verify(noticeRepository, never()).save(any(Notice.class));
    }

    @Test
    @DisplayName("공지사항 상세 조회 성공")
    void getNoticeDetail_Success() {
        // given
        Long noticeId = 1L;
        Account author = mock(Account.class);
        when(author.getAccountId()).thenReturn(10L);
        when(author.getLoginId()).thenReturn("testuser");

        NoticeCategory category = mock(NoticeCategory.class);
        when(category.getId()).thenReturn(1L);
        when(category.getName()).thenReturn("Test Category");

        Notice notice = Notice.builder()
                .title("Test Title")
                .content("Test Content")
                .author(author)
                .category(category)
                .build();

        // ReflectionTestUtils.setField(notice, "id", noticeId); // To set ID if needed,
        // or mock Notice
        Notice spyNotice = spy(notice);
        when(spyNotice.getId()).thenReturn(noticeId);
        when(spyNotice.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(noticeRepository.findById(noticeId)).thenReturn(Optional.of(spyNotice));

        // when
        ExternalNoticeResponse response = noticeService.getNoticeDetail(noticeId);

        // then
        assertNotNull(response);
        assertEquals("Test Title", response.getTitle());
        assertEquals("testuser", response.getAuthorName());
        verify(spyNotice).increaseViewCount();
    }

    @Test
    @DisplayName("공지사항 삭제 성공")
    void deleteNotice_Success() {
        // given
        Long noticeId = 1L;
        Notice notice = mock(Notice.class);
        when(noticeRepository.findById(noticeId)).thenReturn(Optional.of(notice));

        // when
        noticeService.deleteNotice(noticeId);

        // then
        verify(noticeRepository).delete(notice);
    }
}
