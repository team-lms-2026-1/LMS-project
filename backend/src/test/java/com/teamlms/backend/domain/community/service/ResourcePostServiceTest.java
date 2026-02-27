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
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.ExternalResourceRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalResourceResponse;
import com.teamlms.backend.domain.community.entity.ResourceCategory;
import com.teamlms.backend.domain.community.entity.ResourcePost;
import com.teamlms.backend.domain.community.repository.CommunityAccountRepository;
import com.teamlms.backend.domain.community.repository.ResourceAttachmentRepository;
import com.teamlms.backend.domain.community.repository.ResourceCategoryRepository;
import com.teamlms.backend.domain.community.repository.ResourcePostRepository;
import com.teamlms.backend.global.s3.S3Service;

@ExtendWith(MockitoExtension.class)
class ResourcePostServiceTest {

    @InjectMocks
    private ResourcePostService resourcePostService;

    @Mock
    private ResourcePostRepository postRepository;

    @Mock
    private ResourceCategoryRepository categoryRepository;

    @Mock
    private ResourceAttachmentRepository attachmentRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CommunityAccountRepository communityAccountRepository;

    @Mock
    private S3Service s3Service;

    @Test
    @DisplayName("자료실 게시글 생성 성공")
    void createResource_Success() {
        // given
        Long authorId = 1L;
        Long categoryId = 1L;

        Account author = mock(Account.class);
        when(accountRepository.findById(authorId)).thenReturn(Optional.of(author));

        ResourceCategory category = mock(ResourceCategory.class);
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        ExternalResourceRequest request = new ExternalResourceRequest();
        ReflectionTestUtils.setField(request, "categoryId", categoryId);
        ReflectionTestUtils.setField(request, "title", "Test Title");
        ReflectionTestUtils.setField(request, "content", "Test Content");

        when(postRepository.save(any(ResourcePost.class))).thenAnswer(invocation -> {
            ResourcePost post = invocation.getArgument(0);
            ReflectionTestUtils.setField(post, "id", 100L);
            return post;
        });

        // when
        Long resourceId = resourcePostService.create(request, null, authorId);

        // then
        verify(accountRepository).findById(authorId);
        verify(categoryRepository).findById(categoryId);
        verify(postRepository).save(any(ResourcePost.class));
        assertNotNull(resourceId);
        assertEquals(100L, resourceId);
    }

    @Test
    @DisplayName("자료실 게시글 상세 조회 성공")
    void getResourceDetail_Success() {
        // given
        Long resourceId = 1L;

        Account author = mock(Account.class);
        when(author.getAccountId()).thenReturn(10L);

        ResourceCategory category = mock(ResourceCategory.class);
        when(category.getId()).thenReturn(1L);
        when(category.getName()).thenReturn("Test Category");

        ResourcePost post = ResourcePost.builder()
                .title("Test Title")
                .content("Test Content")
                .author(author)
                .category(category)
                .build();

        ResourcePost spyPost = spy(post);
        when(spyPost.getId()).thenReturn(resourceId);
        when(spyPost.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(postRepository.findById(resourceId)).thenReturn(Optional.of(spyPost));
        when(communityAccountRepository.findRealName(10L)).thenReturn("Test Author");

        // when
        ExternalResourceResponse response = resourcePostService.getDetail(resourceId);

        // then
        assertNotNull(response);
        assertEquals("Test Title", response.getTitle());
        assertEquals("Test Author", response.getAuthorName());
        verify(spyPost).increaseViewCount();
    }

    @Test
    @DisplayName("자료실 게시글 삭제 성공")
    void deleteResource_Success() {
        // given
        Long resourceId = 1L;
        ResourcePost post = mock(ResourcePost.class);
        when(postRepository.findById(resourceId)).thenReturn(Optional.of(post));

        // when
        resourcePostService.delete(resourceId);

        // then
        verify(postRepository).deleteById(resourceId);
    }
}
