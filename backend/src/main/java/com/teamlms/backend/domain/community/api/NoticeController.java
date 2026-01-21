package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.ExternalNoticePatchRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalNoticeRequest;
import com.teamlms.backend.domain.community.service.NoticeService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
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
@RequestMapping("/api/v1/community/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    // 2-1. 공지사항 목록 조회
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getNotices(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword
    ) {
        Page<Map<String, Object>> page = noticeService.getNoticeList(pageable, categoryId, keyword);
        return ApiResponse.of(page.getContent(), PageMeta.from(page));
    }

    // 2-2. 상세 조회
    @GetMapping("/{noticeId}")
    public ApiResponse<Map<String, Object>> getNoticeDetail(@PathVariable Long noticeId) {
        Map<String, Object> detail = noticeService.getNoticeDetail(noticeId);
        return ApiResponse.ok(detail);
    }

    // 2-3. 등록 (관리자)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Boolean>> createNotice(
            @RequestPart("request") ExternalNoticeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal AuthUser user
    ) {
        noticeService.createNotice(request, files, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // 2-4. 수정 (관리자)
    @PatchMapping(value = "/{noticeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Boolean>> updateNotice(
            @PathVariable Long noticeId,
            @RequestPart("request") ExternalNoticePatchRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> newFiles
    ) {
        noticeService.updateNotice(noticeId, request, newFiles);
        return ApiResponse.ok(Map.of("success", true));
    }

    // 2-5. 삭제 (관리자)
    @DeleteMapping("/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Boolean>> deleteNotice(@PathVariable Long noticeId) {
        noticeService.deleteNotice(noticeId);
        return ApiResponse.ok(Map.of("success", true));
    }
}
// import com.teamlms.backend.domain.community.api.dto.ExternalNoticePatchRequest;
// import com.teamlms.backend.domain.community.api.dto.ExternalNoticeRequest;
// import com.teamlms.backend.domain.community.api.dto.ExternalNoticeResponse;
// import com.teamlms.backend.domain.community.service.NoticeService;
// import com.teamlms.backend.global.api.ApiResponse;

// //  Security 관련 import 추가
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import com.teamlms.backend.global.security.principal.AuthUser; // (프로젝트의 실제 Principal 클래스 경로에 맞춰 주석 해제)

// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.domain.Sort;
// import org.springframework.data.web.PageableDefault;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.multipart.MultipartFile;

// import java.util.List;
// import java.util.Map;


// //관리자 부분 페이지 네이션 앞에 (/api/v1/admin/) 넣기

// @Slf4j
// @RestController
// @RequestMapping("/api/v1/admin/community/notices")
// @RequiredArgsConstructor
// public class NoticeController {

//     private final NoticeService noticeService;

//     // =================================================================
//     // 1. 공지사항 등록 (Create) - 관리자만 가능
//     // =================================================================

//     @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
//     @ResponseStatus(HttpStatus.CREATED)
//     @PreAuthorize("hasRole('ADMIN')")
//     public ApiResponse<?> createNotice(
//             @Valid @RequestPart("request") ExternalNoticeRequest request,
//             @RequestPart(value = "files", required = false) List<MultipartFile> files,
            
            
//             @AuthenticationPrincipal AuthUser user 
//     ) {
        
//         Long userId = user.getAccountId();

//         Long noticeId = noticeService.createNotice(request, files, userId);
        
//         return ApiResponse.ok(Map.of("success", true, "noticeId", noticeId));
//     }



//     // =================================================================
//     // 2. 목록 조회 (Read List) - 누구나 가능 (로그인 필요 여부는 SecurityConfig에서 설정)
//     // =================================================================
//     @GetMapping
//     public ResponseEntity<Page<ExternalNoticeResponse>> getNoticeList(
//             @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
//             @RequestParam(required = false) Long categoryId,
//             @RequestParam(required = false) String keyword
//     ) {
//         Page<ExternalNoticeResponse> list = noticeService.getNoticeList(pageable, categoryId, keyword);
//         return ResponseEntity.ok(list);
//     }

//     // =================================================================
//     // 3. 상세 조회 (Read Detail) - 누구나 가능
//     // =================================================================
//     @GetMapping("/{noticeId}")
//     public ResponseEntity<ExternalNoticeResponse> getNoticeDetail(
//             @PathVariable Long noticeId
//     ) {
//         ExternalNoticeResponse response = noticeService.getNoticeDetail(noticeId);
//         return ResponseEntity.ok(response);
//     }

// // =================================================================
//     // 4. 공지사항 수정 (텍스트 + 파일 추가/삭제)
//     // =================================================================
//     @PatchMapping(value = "/{noticeId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}) // 👈 중요!
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<Void> updateNotice(
//             @PathVariable Long noticeId,
            
//             // 1. JSON 데이터 (글 내용 + 삭제할 파일 ID)
//             @RequestPart(value = "request") ExternalNoticePatchRequest request,
            
//             // 2. 새로 추가할 파일들 (선택 사항)
//             @RequestPart(value = "files", required = false) List<MultipartFile> newFiles,
            
//             @AuthenticationPrincipal AuthUser user
//     ) {
//         Long userId = user.getAccountId();

//         // 서비스에 새 파일 목록도 같이 넘김
//         noticeService.updateNotice(noticeId, request, newFiles, userId);
        
//         return ResponseEntity.ok().build();
//     }
//     // =================================================================
//     // 5. 삭제 (Delete) -  관리자만 가능
//     // =================================================================
//     @DeleteMapping("/{noticeId}")
//     @PreAuthorize("hasRole('ADMIN')") //  관리자 권한 체크
//     public ResponseEntity<Void> deleteNotice(
//             @PathVariable Long noticeId
//     ) {
//         // 삭제는 보통 ID만 있으면 되지만, 서비스 계층에서 권한 검증용으로 User ID가 필요할 수도 있음
//         noticeService.deleteNotice(noticeId);
//         return ResponseEntity.ok().build();
//     }
// }