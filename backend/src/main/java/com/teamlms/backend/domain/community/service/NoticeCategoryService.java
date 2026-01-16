package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
import com.teamlms.backend.domain.community.entity.NoticeCategory;
import com.teamlms.backend.domain.community.repository.NoticeCategoryRepository;
import com.teamlms.backend.domain.community.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeCategoryService {

    private final NoticeCategoryRepository categoryRepository;
    private final NoticeRepository noticeRepository;

    // =================================================================
    // 1-1. 카테고리 목록 조회 (페이징 + 검색)
    // =================================================================
    public Page<ExternalCategoryResponse> getCategoryList(Pageable pageable, String keyword) {
        Page<NoticeCategory> categories;

        // 검색어가 있으면 검색, 없으면 전체 조회
        if (keyword != null && !keyword.isBlank()) {
            categories = categoryRepository.findByNameContaining(keyword, pageable);
        } else {
            categories = categoryRepository.findAll(pageable);
        }

        // Entity -> DTO 변환
        return categories.map(this::convertToExternalResponse);
    }

    // =================================================================
    // 1-2. 카테고리 수정 (PATCH)
    // =================================================================
    @Transactional
    public void updateCategory(Long categoryId, ExternalCategoryRequest request) {
        NoticeCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        // 이름이 변경되었다면 중복 검사
        if (!category.getName().equals(request.getName()) 
             && categoryRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 카테고리 이름입니다.");
        }

        // 데이터 수정
        category.update(
                request.getName(),
                request.getBgColorHex(),
                request.getTextColorHex()
        );
    }

    // =================================================================
    // 1-3. 카테고리 삭제
    // =================================================================
    @Transactional
    public void deleteCategory(Long categoryId) {
        NoticeCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        // 데이터 무결성 검사: 사용 중인 카테고리는 삭제 불가
        if (noticeRepository.existsByCategory_Id(categoryId)) {
            throw new IllegalStateException("이 카테고리를 사용하는 공지사항이 있어 삭제할 수 없습니다.");
        }

        categoryRepository.delete(category);
    }

    // (등록 메서드 createCategory는 기존과 동일하므로 생략 가능, 필요시 추가)
    @Transactional
    public Long createCategory(ExternalCategoryRequest request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 카테고리 이름입니다.");
        }
        NoticeCategory category = NoticeCategory.builder()
                .name(request.getName())
                .bgColorHex(request.getBgColorHex())
                .textColorHex(request.getTextColorHex())
                .build();
        return categoryRepository.save(category).getId();
    }

    // 헬퍼 메서드
    private ExternalCategoryResponse convertToExternalResponse(NoticeCategory entity) {
        return ExternalCategoryResponse.builder()
                .categoryId(entity.getId())
                .name(entity.getName())
                .bgColorHex(entity.getBgColorHex())
                .textColorHex(entity.getTextColorHex())
                .build();
    }
}