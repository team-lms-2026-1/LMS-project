package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.dto.InternalFaqSearchRequest;
import com.teamlms.backend.domain.community.entity.Faq;
import com.teamlms.backend.domain.community.entity.FaqCategory;
import com.teamlms.backend.domain.community.repository.FaqCategoryRepository;
import com.teamlms.backend.domain.community.repository.FaqRepository;

//에러코드 임포트
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;
    private final FaqCategoryRepository categoryRepository;
    private final AccountRepository accountRepository;

    // 1. 목록 조회
    public Page<ExternalFaqResponse> getList(Pageable pageable, Long categoryId, String keyword) {
        InternalFaqSearchRequest condition = InternalFaqSearchRequest.builder()
                .categoryId(categoryId)
                .keyword(keyword)
                .build();

        Page<Faq> faqs = faqRepository.findBySearchCondition(condition.getCategoryId(), condition.getKeyword(), pageable);
        return faqs.map(this::toResponse);
    }

    // 2. 상세 조회
    @Transactional
    public ExternalFaqResponse getDetail(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND)); // 에러 코드 재사용 or FAQ 전용 생성
        faq.increaseViewCount();
        return toResponse(faq);
    }

    // 3. 등록
    @Transactional
    public Long create(ExternalFaqRequest request, Long authorId) {
        Account author = accountRepository.findById(authorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_AUTHOR_NOT_FOUND));
        FaqCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        Faq faq = Faq.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(category)
                .author(author)
                .build();
        return faqRepository.save(faq).getId();
    }

    // 4. 수정
    @Transactional
    public void update(Long faqId, ExternalFaqPatchRequest request) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        if (request.getCategoryId() != null) {
            FaqCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
            faq.changeCategory(category);
        }
        if (request.getTitle() != null) faq.changeTitle(request.getTitle());
        if (request.getContent() != null) faq.changeContent(request.getContent());
    }

    // 5. 삭제
    @Transactional
    public void delete(Long faqId) {
        faqRepository.deleteById(faqId);
    }

    private ExternalFaqResponse toResponse(Faq entity) {
        return ExternalFaqResponse.builder()
                .faqId(entity.getId())
                .category(ExternalCategoryResponse.builder()
                        .categoryId(entity.getCategory().getId())
                        .name(entity.getCategory().getName())
                        .bgColorHex(entity.getCategory().getBgColorHex())
                        .textColorHex(entity.getCategory().getTextColorHex())
                        .build())
                .title(entity.getTitle())
                .content(entity.getContent())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .build();
    }
}