 package com.teamlms.backend.domain.community.service;

// import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
// import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
// import com.teamlms.backend.domain.community.entity.NoticeCategory;
// import com.teamlms.backend.domain.community.repository.NoticeCategoryRepository;
// import com.teamlms.backend.domain.community.repository.NoticeRepository;


// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// // 에러 코드 임포트
// import com.teamlms.backend.global.exception.base.BusinessException;
// import com.teamlms.backend.global.exception.code.ErrorCode;

// @Service
// @RequiredArgsConstructor
// @Transactional(readOnly = true)
// public class NoticeCategoryService {

//     private final NoticeCategoryRepository categoryRepository;
//     private final NoticeRepository noticeRepository;

//     // =================================================================
//     // 1-1. 카테고리 목록 조회 (페이징 + 검색)
//     // =================================================================
//     public Page<ExternalCategoryResponse> getCategoryList(Pageable pageable, String keyword) {
//         Page<NoticeCategory> categories;

//         // 검색어가 있으면 검색, 없으면 전체 조회
//         if (keyword != null && !keyword.isBlank()) {
//             categories = categoryRepository.findByNameContaining(keyword, pageable);
//         } else {
//             categories = categoryRepository.findAll(pageable);
//         }

//         // Entity -> DTO 변환
//         return categories.map(this::convertToExternalResponse);
//     }

//     // =================================================================
//     // 1-2. 카테고리 수정 (PATCH)
//     // =================================================================
//     @Transactional
//     public void updateCategory(Long categoryId, ExternalCategoryRequest request ) {
//         NoticeCategory category = categoryRepository.findById(categoryId)
//                 .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

//         // 이름이 변경되었다면 중복 검사
//         if (!category.getName().equals(request.getName()) 
//              && categoryRepository.findByName(request.getName()).isPresent()) {
//             throw new BusinessException(ErrorCode.DUPLICATE_CATEGORY_NAME);
//         }

//         // 데이터 수정
//         category.update(
//                 request.getName(),
//                 request.getBgColorHex(),
//                 request.getTextColorHex()
//         );
//     }

//     // =================================================================
//     // 1-3. 카테고리 삭제
//     // =================================================================
//     @Transactional
//     public void deleteCategory(Long categoryId) {
//         NoticeCategory category = categoryRepository.findById(categoryId)
//                 .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

//         // 데이터 무결성 검사: 사용 중인 카테고리는 삭제 불가
//         if (noticeRepository.existsByCategory_Id(categoryId)) {
//             throw new BusinessException(ErrorCode.CATEGORY_DELETE_NOT_ALLOWED);
//         }

//         categoryRepository.delete(category);
//     }

//     // (등록 메서드 createCategory는 기존과 동일하므로 생략 가능, 필요시 추가)
//     @Transactional
//     public Long createCategory(ExternalCategoryRequest request) {
//         if (categoryRepository.findByName(request.getName()).isPresent()) {
//             throw new BusinessException(ErrorCode. DUPLICATE_CATEGORY_NAME);
//         }
//         NoticeCategory category = NoticeCategory.builder()
//                 .name(request.getName())
//                 .bgColorHex(request.getBgColorHex())
//                 .textColorHex(request.getTextColorHex())
//                 .build();
//         return categoryRepository.save(category).getId();
//     }

//     // 헬퍼 메서드
//     private ExternalCategoryResponse convertToExternalResponse(NoticeCategory entity) {
//         return ExternalCategoryResponse.builder()
//                 .categoryId(entity.getId())
//                 .name(entity.getName())
//                 .bgColorHex(entity.getBgColorHex())
//                 .textColorHex(entity.getTextColorHex())
//                 .build();
//     }
// }
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.entity.NoticeCategory;
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
        // if (categoryRepository.existsByName(request.getName())) {
        //     throw new BusinessException(ErrorCode.DUPLICATE_CATEGORY_NAME);
        // }

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
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_CATEGORY));

        category.update(request.getName(), request.getBgColorHex(), request.getTextColorHex());
    }

    // 3. 삭제
    @Transactional
    public void deleteCategory(Long categoryId) {
        NoticeCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_CATEGORY));

        // (선택사항) 해당 카테고리에 글이 있으면 삭제 막기
        // if (noticeRepository.countByCategory(category) > 0) {
        //     throw new BusinessException(ErrorCode.CATEGORY_HAS_POSTS);
        // }

        categoryRepository.delete(category);
    }

    private String formatDateTime(LocalDateTime dt) {
        if (dt == null) return null;
        return dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
    }
}