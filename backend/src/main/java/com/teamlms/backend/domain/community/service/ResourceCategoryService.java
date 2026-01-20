package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
import com.teamlms.backend.domain.community.entity.ResourceCategory;
import com.teamlms.backend.domain.community.repository.ResourceCategoryRepository;
import com.teamlms.backend.domain.community.repository.ResourcePostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// 에러 코드 임포트
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceCategoryService {

    private final ResourceCategoryRepository categoryRepository;
    private final ResourcePostRepository postRepository; // 삭제 시 무결성 검증용

    // 1. 목록 조회
    public Page<ExternalCategoryResponse> getList(Pageable pageable, String keyword) {
        Page<ResourceCategory> page;
        
        if (keyword != null && !keyword.isBlank()) {
            page = categoryRepository.findByNameContaining(keyword, pageable);
        } else {
            page = categoryRepository.findAll(pageable);
        }

        // Entity -> DTO 변환
        return page.map(entity -> ExternalCategoryResponse.builder()
                .categoryId(entity.getId())
                .name(entity.getName())
                .bgColorHex(entity.getBgColorHex())
                .textColorHex(entity.getTextColorHex())
                .build());
    }

    // 2. 등록
    @Transactional
    public Long create(ExternalCategoryRequest request) {
        // 이름 중복 검사
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new BusinessException(ErrorCode.DUPLICATE_CATEGORY_NAME);
        }

        ResourceCategory category = ResourceCategory.builder()
                .name(request.getName())
                .bgColorHex(request.getBgColorHex())
                .textColorHex(request.getTextColorHex())
                .build();

        return categoryRepository.save(category).getId();
    }

    // 3. 수정
    @Transactional
    public void update(Long categoryId, ExternalCategoryRequest request) {
        ResourceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        // 이름 변경 시 중복 검사 (자기 자신은 제외)
        if (!category.getName().equals(request.getName()) 
             && categoryRepository.findByName(request.getName()).isPresent()) {
            throw new BusinessException(ErrorCode.DUPLICATE_CATEGORY_NAME);
        }

        category.update(request.getName(), request.getBgColorHex(), request.getTextColorHex());
    }

    // 4. 삭제
    @Transactional
    public void delete(Long categoryId) {
        // 해당 카테고리를 사용하는 게시글이 있는지 확인
        if (postRepository.existsByCategory_Id(categoryId)) {
            throw new BusinessException(ErrorCode.CATEGORY_DELETE_NOT_ALLOWED);
        }

        categoryRepository.deleteById(categoryId);
    }
}