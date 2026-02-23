package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.ExternalNoticePatchRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalNoticeRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalNoticeResponse; // ★ DTO 임포트 추가
import com.teamlms.backend.domain.community.service.NoticeService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
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
@RequestMapping
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    // 2-1. 공지사항 목록 조회
    @GetMapping({"/api/v1/student/community/notices",
                 "/api/v1/professor/community/notices",
                 "/api/v1/admin/community/notices" 
    })
    @PreAuthorize("hasAuthority('NOTICE_READ') or hasAnyRole('STUDENT','PROFESSOR','ADMIN')")
    public ApiResponse<List<ExternalNoticeResponse>> getNotices(
            @RequestParam(defaultValue = "1") int page,       // @PageableDefault 대신 사용
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword
    ) {
        // 1. 페이지 및 사이즈 유효성 검사 (안전장치)
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        // 2. PageRequest 생성 (프론트의 1페이지를 JPA의 0페이지로 변환)
        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        // 3. 서비스 호출 (이미 DTO로 반환하도록 설계됨)
        Page<ExternalNoticeResponse> pageResult = noticeService.getNoticeList(pageable, categoryId, keyword);
        
        // 4. 공통 규격으로 응답
        return ApiResponse.of(
                pageResult.getContent(), 
                PageMeta.from(pageResult)
        );
    }

    // 2-2. 상세 조회
    @GetMapping({"/api/v1/student/community/notices/{noticeId}",
                 "/api/v1/professor/community/notices/{noticeId}",
                 "/api/v1/admin/community/notices/{noticeId}"
    })
    @PreAuthorize("hasAuthority('NOTICE_READ') or hasAnyRole('STUDENT','PROFESSOR','ADMIN')")
    // ★ Map -> ExternalNoticeResponse 로 변경
    public ApiResponse<ExternalNoticeResponse> getNoticeDetail(@PathVariable Long noticeId) {
        // ★ Service가 DTO를 반환하므로 타입을 맞춰줌
        ExternalNoticeResponse detail = noticeService.getNoticeDetail(noticeId);
        return ApiResponse.ok(detail);
    }

    // 2-3. 등록 (관리자)
    @PostMapping(value = "/api/v1/admin/community/notices", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Boolean>> createNotice(
            @RequestPart("request") ExternalNoticeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal AuthUser user
    ) {
        // user.getAccountId() 사용 확인
        noticeService.createNotice(request, files, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // 2-4. 수정 (관리자)
    @PatchMapping(value = "/api/v1/admin/community/notices/{noticeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Boolean>> updateNotice(
            @PathVariable Long noticeId,
            @RequestPart("request") ExternalNoticePatchRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> newFiles,
            @AuthenticationPrincipal AuthUser user // ★ 수정자 ID를 얻기 위해 추가
    ) {
        // ★ 서비스 파라미터 개수에 맞춰 user.getAccountId() 추가
        noticeService.updateNotice(noticeId, request, newFiles, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // 2-5. 삭제 (관리자)
    @DeleteMapping("/api/v1/admin/community/notices/{noticeId}")
    @PreAuthorize("hasAuthority('NOTICE_MANAGE')")
    public ApiResponse<Map<String, Boolean>> deleteNotice(@PathVariable Long noticeId) {
        noticeService.deleteNotice(noticeId);
        return ApiResponse.ok(Map.of("success", true));
    }
}