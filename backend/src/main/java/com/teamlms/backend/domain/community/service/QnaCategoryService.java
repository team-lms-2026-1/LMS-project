package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
import com.teamlms.backend.domain.community.entity.QnaCategory;
import com.teamlms.backend.domain.community.repository.QnaCategoryRepository;
import com.teamlms.backend.domain.community.repository.QnaQuestionRepository;
// 에러코드 임포트
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QnaCategoryService {

    private final QnaCategoryRepository categoryRepository;
    private final QnaQuestionRepository questionRepository;

    public Page<ExternalCategoryResponse> getList(Pageable pageable, String keyword) {
        Page<QnaCategory> page = (keyword != null && !keyword.isBlank()) 
                ? categoryRepository.findByNameContaining(keyword, pageable)
                : categoryRepository.findAll(pageable);

        return page.map(entity -> ExternalCategoryResponse.builder()
                .categoryId(entity.getId())
                .name(entity.getName())
                .bgColorHex(entity.getBgColorHex())
                .textColorHex(entity.getTextColorHex())
                .build());
    }

    @Transactional
    public Long create(ExternalCategoryRequest request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new BusinessException(ErrorCode.DUPLICATE_CATEGORY_NAME);
        }
        QnaCategory category = QnaCategory.builder()
                .name(request.getName())
                .bgColorHex(request.getBgColorHex())
                .textColorHex(request.getTextColorHex())
                .build();
        return categoryRepository.save(category).getId();
    }

    @Transactional
    public void update(Long categoryId, ExternalCategoryRequest request) {
        QnaCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getName().equals(request.getName()) 
                && categoryRepository.findByName(request.getName()).isPresent()) {
            throw new BusinessException(ErrorCode.DUPLICATE_CATEGORY_NAME);
        }
        category.update(request.getName(), request.getBgColorHex(), request.getTextColorHex());
    }

    @Transactional
    public void delete(Long categoryId) {
        if (questionRepository.existsByCategory_Id(categoryId)) {
            throw new BusinessException(ErrorCode.CATEGORY_DELETE_NOT_ALLOWED);
        }
        categoryRepository.deleteById(categoryId);
    }
}