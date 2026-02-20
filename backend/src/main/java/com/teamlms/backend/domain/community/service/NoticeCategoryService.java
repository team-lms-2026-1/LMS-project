package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.entity.NoticeCategory;
// import com.teamlms.backend.domain.community.entity.ResourceCategory;
import com.teamlms.backend.domain.community.repository.NoticeCategoryRepository;
import com.teamlms.backend.domain.community.repository.NoticeRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeCategoryService {

    private final NoticeCategoryRepository categoryRepository;
    private final NoticeRepository noticeRepository; // 게시글 수 카운트용

    // 0. 등록 (추가)
    @Transactional
    public Long createCategory(ExternalCategoryRequest request) {
        // 이름 중복 검사 (선택 사항)
        if (categoryRepository.existsByName(request.getName())) {
            throw new BusinessException(ErrorCode.DUPLICATE_CATEGORY_NAME);
        }

        NoticeCategory category = NoticeCategory.builder()
                .name(request.getName())
                .bgColorHex(request.getBgColorHex())
                .textColorHex(request.getTextColorHex())
                .build();

        NoticeCategory savedCategory = categoryRepository.save(category);
        return savedCategory.getId();
    }

    // 1. 목록 조회
    public Page<Map<String, Object>> getCategoryList(Pageable pageable, String keyword) {
        Page<NoticeCategory> categories;

        if (keyword != null && !keyword.isBlank()) {
            categories = categoryRepository.findByNameContaining(keyword, pageable);
        } else {
            categories = categoryRepository.findAll(pageable);
        }

        // Entity -> Map 변환 (postCount 포함)
        return categories.map(cat -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("categoryId", cat.getId());
            map.put("name", cat.getName());
            map.put("postCount", noticeRepository.countByCategory(cat)); // 게시글 수
            map.put("bgColorHex", cat.getBgColorHex());
            map.put("textColorHex", cat.getTextColorHex());
            map.put("createdAt", formatDateTime(cat.getCreatedAt()));
            return map;
        });
    }

    // 2. 수정
    @Transactional
    public void updateCategory(Long categoryId, ExternalCategoryRequest request) {
        NoticeCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        // 이름 변경 시 중복 검사 (자기 자신은 제외)
        if (!category.getName().equals(request.getName())
                && categoryRepository.findByName(request.getName()).isPresent()) {
            throw new BusinessException(ErrorCode.DUPLICATE_CATEGORY_NAME);
        }

        category.update(request.getName(), request.getBgColorHex(), request.getTextColorHex());
    }

    // 3. 삭제
    @Transactional
    public void deleteCategory(Long categoryId) {
        NoticeCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        // (선택사항) 해당 카테고리에 글이 있으면 삭제 막기
        if (noticeRepository.countByCategory(category) > 0) {
            throw new BusinessException(ErrorCode.CATEGORY_DELETE_NOT_ALLOWED);
        }

        categoryRepository.delete(category);
    }

    private String formatDateTime(LocalDateTime dt) {
        if (dt == null)
            return null;
        return dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
    }
}