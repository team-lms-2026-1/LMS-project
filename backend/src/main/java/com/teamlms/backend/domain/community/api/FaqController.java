package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.service.FaqService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
// import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;


@RestController
@RequestMapping //("/api/v1/community/faqs") // 정책서 경로: /faqs
@RequiredArgsConstructor
public class FaqController {

    private final FaqService service;
    // =================================================================
    // 1. FAQ 목록 조회 - 전부가능
    // =================================================================
    @GetMapping({"/api/v1/student/community/faqs",
                 "/api/v1/professor/community/faqs",
                 "/api/v1/admin/community/faqs" 
    })
    @PreAuthorize("hasAuthority('FAQ_READ')")
    public ApiResponse<List<ExternalFaqResponse>> getFaqs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword
    ) {
        // 1. 페이지 및 사이즈 유효성 검사 (안전장치: 페이지는 최소 1, 사이즈는 1~100 제한)
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        // 2. PageRequest 생성 (프론트의 1페이지를 JPA의 0페이지로 변환 및 정렬 설정)
        // FAQ 특성상 최신순(createdAt DESC)으로 설정하거나 필요시 sortOrder를 추가할 수 있습니다.
        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        // 3. 서비스 호출
        Page<ExternalFaqResponse> pageResult = service.getList(pageable, categoryId, keyword);
        
        // 4. 공통 규격(데이터 + 메타 데이터)으로 응답
        return ApiResponse.of(
                pageResult.getContent(), 
                PageMeta.from(pageResult)
        );
    }
    // =================================================================
    // 2. FAQ 상세 조회 - 전부가능
    // =================================================================
    @GetMapping({"/api/v1/student/community/faqs/{id}",
                 "/api/v1/professor/community/faqs/{id}",
                 "/api/v1/admin/community/faqs/{id}" 
    })
    @PreAuthorize("hasAuthority('FAQ_READ')")
    public ApiResponse<?> getDetail(@PathVariable("id") Long faqId) {
        return ApiResponse.ok(service.getDetail(faqId));
    }

    // =================================================================
    // 3. FAQ 등록 - 어드민만 가능
    // FAQ는 파일이 없으므로 순수 JSON (@RequestBody) 사용
    // =================================================================
    @PostMapping("/api/v1/admin/community/faqs")
    @PreAuthorize("hasAuthority('FAQ_MANAGE')")
    public ApiResponse<?> create(
            @Valid @RequestBody ExternalFaqRequest request,
            @AuthenticationPrincipal AuthUser user) {
        Long id = service.create(request, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true, "faqId", id));
    }

    // =================================================================
    // 4. FAQ 수정 - 어드민만 가능
    // =================================================================
    @PatchMapping("/api/v1/admin/community/faqs/{faqId}")
    @PreAuthorize("hasAuthority('FAQ_MANAGE')")
    public ApiResponse<?> update(
            @PathVariable Long faqId,
            @RequestBody ExternalFaqPatchRequest request) {
        service.update(faqId, request);
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 5. FAQ 삭제 - 어드민만 가능
    // =================================================================
    @DeleteMapping("/api/v1/admin/community/faqs/{faqId}")
    @PreAuthorize("hasAuthority('FAQ_MANAGE')")
    public ApiResponse<?> delete(@PathVariable Long faqId) {
        service.delete(faqId);
        return ApiResponse.ok(Map.of("success", true));
    }
}