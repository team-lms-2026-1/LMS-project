package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.service.ResourcePostService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping // ("/api/v1/community/resources")
@RequiredArgsConstructor
public class ResourcePostController {

    private final ResourcePostService postService;

    // =================================================================
    // 1. 자료실 목록 조회 - 전부가능
    // =================================================================

    @GetMapping({ "/api/v1/student/community/resources",
            "/api/v1/professor/community/resources",
            "/api/v1/admin/community/resources"
    })
    @PreAuthorize("hasAuthority('RESOURCE_READ')")
    public ApiResponse<List<ExternalResourceResponse>> getResources(
            @RequestParam(defaultValue = "1") int page, // 프론트 전달 페이지 (1부터 시작)
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        // 1. 페이지 및 사이즈 유효성 검사 (안전장치)
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);
        // 2. PageRequest 생성 (1페이지를 JPA 0페이지로 변환 및 최신순 정렬)
        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        // 3. 서비스 호출 (기존 postService 사용)
        Page<ExternalResourceResponse> pageResult = postService.getList(pageable, categoryId, keyword);
        // 4. 공통 규격(데이터 + 메타 데이터)으로 응답
        return ApiResponse.of(
                pageResult.getContent(),
                PageMeta.from(pageResult));
    }

    // =================================================================
    // 2. 자료실 상세 조회 - 전부가능
    // =================================================================
    @GetMapping({ "/api/v1/student/community/resources/{resourceId}",
            "/api/v1/professor/community/resources/{resourceId}",
            "/api/v1/admin/community/resources/{resourceId}"
    })
    @PreAuthorize("hasAuthority('RESOURCE_READ')")
    public ApiResponse<?> getDetail(@PathVariable Long resourceId) {
        ExternalResourceResponse response = postService.getDetail(resourceId);
        return ApiResponse.ok(response);
    }

    // =================================================================
    // 3. 자료실 등록 - 어드민만 가능
    // =================================================================
    @PostMapping(value = "/api/v1/admin/community/resources", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasAuthority('RESOURCE_MANAGE')")
    public ApiResponse<?> create(
            // JSON 데이터는 @RequestPart로 받음
            @Valid @RequestPart("request") ExternalResourceRequest request,
            // 파일 데이터는 List<MultipartFile>로 받음 (선택값)
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal AuthUser user) {
        Long resourceId = postService.create(request, files, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true, "resourceId", resourceId));
    }

    // =================================================================
    // 4. 자료실 수정 - 어드민만 가능
    // =================================================================
    @PatchMapping(value = "/api/v1/admin/community/resources/{resourceId}", consumes = {
            MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasAuthority('RESOURCE_MANAGE')")
    public ApiResponse<?> update(
            @PathVariable Long resourceId,
            // 수정용 DTO (Validation 없음)
            @RequestPart("request") ExternalResourcePatchRequest request,
            // 새로 추가할 파일들 (선택값)
            @RequestPart(value = "files", required = false) List<MultipartFile> newFiles,
            @AuthenticationPrincipal AuthUser user) {
        postService.update(resourceId, request, newFiles, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 5. 자료실 삭제 - 어드민만 가능
    // =================================================================
    @DeleteMapping("/api/v1/admin/community/resources/{resourceId}")
    @PreAuthorize("hasAuthority('RESOURCE_MANAGE')")
    public ApiResponse<?> delete(@PathVariable Long resourceId) {
        postService.delete(resourceId);
        return ApiResponse.ok(Map.of("success", true));
    }
}