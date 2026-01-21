package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.service.ResourcePostService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/community/resources")
@RequiredArgsConstructor
public class ResourcePostController {

    private final ResourcePostService postService;

    
    // =================================================================
    // 1. 자료실 목록 조회 - 전부가능
    // =================================================================
    @GetMapping
    public ApiResponse<?> getList(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword
    ) {
        Page<ExternalResourceResponse> result = postService.getList(pageable, categoryId, keyword);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    
    // =================================================================
    // 2. 자료실 상세 조회 - 전부가능
    // =================================================================
    @GetMapping("/{resourceId}")
    public ApiResponse<?> getDetail(@PathVariable Long resourceId) {
        ExternalResourceResponse response = postService.getDetail(resourceId);
        return ApiResponse.ok(response);
    }

    
    // =================================================================
    // 3. 자료실 등록 - 어드민만 가능
    // =================================================================
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> create(
            // JSON 데이터는 @RequestPart로 받음
            @Valid @RequestPart("request") ExternalResourceRequest request,
            // 파일 데이터는 List<MultipartFile>로 받음 (선택값)
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal AuthUser user
    ) {
        Long resourceId = postService.create(request, files, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true, "resourceId", resourceId));
    }

    
    // =================================================================
    // 4. 자료실 수정 - 어드민만 가능
    // =================================================================
    @PatchMapping(value = "/{resourceId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> update(
            @PathVariable Long resourceId,
            // 수정용 DTO (Validation 없음)
            @RequestPart("request") ExternalResourcePatchRequest request,
            // 새로 추가할 파일들 (선택값)
            @RequestPart(value = "files", required = false) List<MultipartFile> newFiles,
            @AuthenticationPrincipal AuthUser user
    ) {
        postService.update(resourceId, request, newFiles, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    
    // =================================================================
    // 5. 자료실 삭제 - 어드민만 가능
    // =================================================================
    @DeleteMapping("/{resourceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> delete(@PathVariable Long resourceId) {
        postService.delete(resourceId);
        return ApiResponse.ok(Map.of("success", true));
    }
}