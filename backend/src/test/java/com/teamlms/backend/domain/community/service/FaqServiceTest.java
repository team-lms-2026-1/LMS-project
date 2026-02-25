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
import com.teamlms.backend.domain.community.api.dto.ExternalFaqRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalFaqResponse;
import com.teamlms.backend.domain.community.entity.Faq;
import com.teamlms.backend.domain.community.entity.FaqCategory;
import com.teamlms.backend.domain.community.repository.FaqCategoryRepository;
import com.teamlms.backend.domain.community.repository.FaqRepository;

@ExtendWith(MockitoExtension.class)
class FaqServiceTest {

    @InjectMocks
    private FaqService faqService;

    @Mock
    private FaqRepository faqRepository;

    @Mock
    private FaqCategoryRepository categoryRepository;

    @Mock
    private AccountRepository accountRepository;

    @Test
    @DisplayName("FAQ 생성 성공")
    void createFaq_Success() {
        // given
        Long authorId = 1L;
        Long categoryId = 1L;

        Account author = mock(Account.class);
        when(accountRepository.findById(authorId)).thenReturn(Optional.of(author));

        FaqCategory category = mock(FaqCategory.class);
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        ExternalFaqRequest request = new ExternalFaqRequest();
        ReflectionTestUtils.setField(request, "categoryId", categoryId);
        ReflectionTestUtils.setField(request, "title", "Test FAQ Title");
        ReflectionTestUtils.setField(request, "content", "Test FAQ Content");

        when(faqRepository.save(any(Faq.class))).thenAnswer(invocation -> {
            Faq faq = invocation.getArgument(0);
            ReflectionTestUtils.setField(faq, "id", 200L);
            return faq;
        });

        // when
        Long faqId = faqService.create(request, authorId);

        // then
        verify(accountRepository).findById(authorId);
        verify(categoryRepository).findById(categoryId);
        verify(faqRepository).save(any(Faq.class));
        assertNotNull(faqId);
        assertEquals(200L, faqId);
    }

    @Test
    @DisplayName("FAQ 상세 조회 성공")
    void getFaqDetail_Success() {
        // given
        Long faqId = 1L;

        FaqCategory category = mock(FaqCategory.class);
        when(category.getId()).thenReturn(1L);
        when(category.getName()).thenReturn("FAQ Category");

        Faq faq = Faq.builder()
                .title("Test FAQ Title")
                .content("Test FAQ Content")
                .category(category)
                .build();

        Faq spyFaq = spy(faq);
        when(spyFaq.getId()).thenReturn(faqId);
        when(spyFaq.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(faqRepository.findById(faqId)).thenReturn(Optional.of(spyFaq));

        // when
        ExternalFaqResponse response = faqService.getDetail(faqId);

        // then
        assertNotNull(response);
        assertEquals("Test FAQ Title", response.getTitle());
        verify(spyFaq).increaseViewCount();
    }

    @Test
    @DisplayName("FAQ 삭제 성공")
    void deleteFaq_Success() {
        // given
        Long faqId = 1L;

        // when
        faqService.delete(faqId);

        // then
        verify(faqRepository).deleteById(faqId);
    }
}
