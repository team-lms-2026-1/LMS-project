package com.teamlms.backend.domain.community.api;

// import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
// import com.teamlms.backend.domain.community.api.dto.ExternalCategoryResponse;
// import com.teamlms.backend.domain.community.service.NoticeCategoryService;
// import org.springframework.security.access.prepost.PreAuthorize;

// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.domain.Sort;
// import org.springframework.data.web.PageableDefault;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// //관리자 부분 페이지 네이션 앞에 (/api/v1/admin/) 넣기

// @RestController
// // URL 구조 반영: /notices/categories (앞에 /api/community 등은 프로젝트 규칙에 따름)
// @RequestMapping("/api/v1/admin/community/notices/categories") 
// @RequiredArgsConstructor
// public class NoticeCategoryController {

//     private final NoticeCategoryService categoryService;

//     // =================================================================
//     // 1-1. 카테고리 목록 조회 
//     // URL: GET /api/community/notices/categories?page=1&size=20&keyword=...
//     // =================================================================
//     @GetMapping
//     public ResponseEntity<Page<ExternalCategoryResponse>> getCategoryList(
//             @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
//             @RequestParam(required = false) String keyword
//     ) {
//         Page<ExternalCategoryResponse> list = categoryService.getCategoryList(pageable, keyword);
//         return ResponseEntity.ok(list);
//     }

//     // =================================================================
//     // 1-2. 카테고리 수정 (관리자)
//     // URL: PATCH /api/community/notices/categories/{categoryId}
//     // =================================================================
//     @PatchMapping("/{categoryId}")
//     @PreAuthorize("hasRole('ADMIN')") //  ADMIN 권한 체크
//     public ResponseEntity<Void> updateCategory(
//             @PathVariable Long categoryId,
//             @Valid @RequestBody ExternalCategoryRequest request
//     ) {
//         categoryService.updateCategory(categoryId, request);
//         return ResponseEntity.ok().build();
//     }

//     // =================================================================
//     // 1-3. 카테고리 삭제 (관리자)
//     // URL: DELETE /api/community/notices/categories/{categoryId}
//     // =================================================================
//     @DeleteMapping("/{categoryId}")
//     @PreAuthorize("hasRole('ADMIN')") //  ADMIN 권한 체크
//     public ResponseEntity<Void> deleteCategory(
//             @PathVariable Long categoryId
//     ) {
//         categoryService.deleteCategory(categoryId);
//         return ResponseEntity.ok().build();
//     }
    
// // =================================================================
//     // 1-0. 카테고리 등록 (관리자)
//     // URL: POST /api/v1/admin/community/notices/categories
//     // =================================================================
//     @PostMapping
//     @PreAuthorize("hasRole('ADMIN')") // 관리자만 가능
//     public ResponseEntity<Long> createCategory(@Valid @RequestBody ExternalCategoryRequest request) {
//         // 서비스에서 등록 후 생성된 ID를 반환받음
//         Long categoryId = categoryService.createCategory(request);
//         return ResponseEntity.ok(categoryId);
//     }
// }
import com.teamlms.backend.domain.community.api.dto.ExternalCategoryRequest;
import com.teamlms.backend.domain.community.service.NoticeCategoryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta; 
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NoticeCategoryController {

    private final NoticeCategoryService categoryService;

    // 1-0. 카테고리 등록 (관리자) - [추가된 부분]
    @PostMapping("/api/v1/admin/community/notices/categories")
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Object>> createCategory(
            @RequestBody ExternalCategoryRequest request
    ) {
        Long categoryId = categoryService.createCategory(request);
        // 성공 여부와 생성된 ID를 함께 반환
        return ApiResponse.ok(Map.of("success", true, "categoryId", categoryId));
    }

    // 1-1. 카테고리 목록 조회
    @GetMapping({"/api/v1/student/community/notices/categories",
                 "/api/v1/professor/community/notices/categories",
                 "/api/v1/admin/community/notices/categories"
    })
    @PreAuthorize("hasAuthority('NOTICE_READ')")
    public ApiResponse<List<Map<String, Object>>> getCategories(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String keyword
    ) {
        Page<Map<String, Object>> page = categoryService.getCategoryList(pageable, keyword);
        return ApiResponse.of(page.getContent(), PageMeta.from(page));
    }

    // 1-2. 카테고리 수정 (관리자)
    @PatchMapping("/api/v1/admin/community/notices/categories/{categoryId}")
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Boolean>> updateCategory(
            @PathVariable Long categoryId,
            @RequestBody ExternalCategoryRequest request
    ) {
        categoryService.updateCategory(categoryId, request);
        return ApiResponse.ok(Map.of("success", true));
    }

    // 1-3. 카테고리 삭제 (관리자)
    @DeleteMapping("/api/v1/admin/community/notices/categories/{categoryId}")
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Boolean>> deleteCategory(
            @PathVariable Long categoryId
    ) {
        categoryService.deleteCategory(categoryId);
        return ApiResponse.ok(Map.of("success", true));
    }
}