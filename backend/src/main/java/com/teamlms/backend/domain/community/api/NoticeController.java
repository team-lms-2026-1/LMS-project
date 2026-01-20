package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.ExternalNoticeRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalNoticeResponse;
import com.teamlms.backend.domain.community.service.NoticeService;
import com.teamlms.backend.global.api.ApiResponse;

//  Security 관련 import 추가
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.teamlms.backend.global.security.principal.AuthUser; // (프로젝트의 실제 Principal 클래스 경로에 맞춰 주석 해제)

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;


//관리자 부분 페이지 네이션 앞에 (/api/v1/admin/) 넣기

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/community/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    // =================================================================
    // 1. 공지사항 등록 (Create) - 관리자만 가능
    // =================================================================

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> createNotice(
            @Valid @RequestPart("request") ExternalNoticeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            
            
            @AuthenticationPrincipal AuthUser user 
    ) {
        
        Long userId = user.getAccountId(); 

        Long noticeId = noticeService.createNotice(request, files, userId);
        
        return ApiResponse.ok(Map.of("success", true, "noticeId", noticeId));
    }



    // // =================================================================
    // // 1. 등록 (Create) -  관리자만 가능
    // // =================================================================
    // @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    // @PreAuthorize("hasRole('ADMIN')") //  관리자 권한 체크
    // public ResponseEntity<Long> createNotice(
    //         @Valid @RequestPart("request") ExternalNoticeRequest request,
    //         @RequestPart(value = "files", required = false) List<MultipartFile> files
    //         //  실제 로그인한 관리자 ID를 가져오려면 아래 주석을 해제하고 사용하세요
    //         //, @AuthenticationPrincipal UserPrincipal user 
    // ) {
    //     // 임시 사용자 ID (로그인 기능 연동 전 테스트용)
    //     Long mockUserId = 1L; 
        
    //     // 실제 연동 시: Long userId = user.getId();

    //     Long noticeId = noticeService.createNotice(request, files, mockUserId);
        
    //     return ResponseEntity.ok(noticeId);
    // }

    // =================================================================
    // 2. 목록 조회 (Read List) - 누구나 가능 (로그인 필요 여부는 SecurityConfig에서 설정)
    // =================================================================
    @GetMapping
    public ResponseEntity<Page<ExternalNoticeResponse>> getNoticeList(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword
    ) {
        Page<ExternalNoticeResponse> list = noticeService.getNoticeList(pageable, categoryId, keyword);
        return ResponseEntity.ok(list);
    }

    // =================================================================
    // 3. 상세 조회 (Read Detail) - 누구나 가능
    // =================================================================
    @GetMapping("/{noticeId}")
    public ResponseEntity<ExternalNoticeResponse> getNoticeDetail(
            @PathVariable Long noticeId
    ) {
        ExternalNoticeResponse response = noticeService.getNoticeDetail(noticeId);
        return ResponseEntity.ok(response);
    }

    // =================================================================
    // 4. 수정 (Update) - 관리자만 가능
    // =================================================================
    @PutMapping("/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')") //  관리자 권한 체크
    public ResponseEntity<Void> updateNotice(
            @PathVariable Long noticeId,
            @Valid @RequestBody ExternalNoticeRequest request
            // , @AuthenticationPrincipal UserPrincipal user 
    ) {
        Long mockUserId = 1L;
        // Long userId = user.getId();

        noticeService.updateNotice(noticeId, request, mockUserId);
        return ResponseEntity.ok().build();
    }

    // =================================================================
    // 5. 삭제 (Delete) - ★ 관리자만 가능
    // =================================================================
    @DeleteMapping("/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')") //  관리자 권한 체크
    public ResponseEntity<Void> deleteNotice(
            @PathVariable Long noticeId
    ) {
        // 삭제는 보통 ID만 있으면 되지만, 서비스 계층에서 권한 검증용으로 User ID가 필요할 수도 있음
        noticeService.deleteNotice(noticeId);
        return ResponseEntity.ok().build();
    }
}