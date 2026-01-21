package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.service.FaqService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/community/faqs") // 정책서 경로: /faqs
@RequiredArgsConstructor
public class FaqController {

    private final FaqService service;
    // =================================================================
    // 1. FAQ 목록 조회 - 전부가능
    // =================================================================
    @GetMapping
    public ApiResponse<?> getList(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        Page<ExternalFaqResponse> result = service.getList(pageable, categoryId, keyword);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
    
    // =================================================================
    // 2. FAQ 상세 조회 - 전부가능
    // =================================================================
    @GetMapping("/{faqId}")
    public ApiResponse<?> getDetail(@PathVariable Long faqId) {
        return ApiResponse.ok(service.getDetail(faqId));
    }

    // =================================================================
    // 3. FAQ 등록 - 어드민만 가능
    // FAQ는 파일이 없으므로 순수 JSON (@RequestBody) 사용
    // =================================================================
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> create(
            @Valid @RequestBody ExternalFaqRequest request,
            @AuthenticationPrincipal AuthUser user) {
        Long id = service.create(request, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true, "faqId", id));
    }

    // =================================================================
    // 4. FAQ 수정 - 어드민만 가능
    // =================================================================
    @PatchMapping("/{faqId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> update(
            @PathVariable Long faqId,
            @RequestBody ExternalFaqPatchRequest request) {
        service.update(faqId, request);
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 5. FAQ 삭제 - 어드민만 가능
    // =================================================================
    @DeleteMapping("/{faqId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> delete(@PathVariable Long faqId) {
        service.delete(faqId);
        return ApiResponse.ok(Map.of("success", true));
    }
}