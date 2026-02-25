package com.teamlms.backend.domain.mypage.api;

import com.teamlms.backend.domain.mypage.service.MyPageCommandService;
import com.teamlms.backend.domain.mypage.service.MyPageQueryService;
import com.teamlms.backend.global.api.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/mypage")
@RequiredArgsConstructor
public class AdminMyPageController {

    private final MyPageCommandService myPageCommandService;
    private final MyPageQueryService myPageQueryService;

    @PatchMapping(value = "/student/{accountId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('MYPAGE_MANAGE')")
    public ApiResponse<String> updateStudentProfileImage(
            @PathVariable Long accountId,
            @RequestPart("file") MultipartFile file) {
        String imageUrl = myPageCommandService.uploadStudentProfileImage(accountId, file);
        return ApiResponse.ok(imageUrl);
    }

    @PostMapping(value = "/student/{accountId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('MYPAGE_MANAGE')")
    public ApiResponse<String> uploadStudentProfileImage(
            @PathVariable Long accountId,
            @RequestPart("file") MultipartFile file) {
        String imageUrl = myPageCommandService.uploadStudentProfileImage(accountId, file);
        return ApiResponse.ok(imageUrl);
    }

    @DeleteMapping(value = "/student/{accountId}/image")
    @PreAuthorize("hasAuthority('MYPAGE_MANAGE')")
    public ApiResponse<Void> deleteStudentProfileImage(@PathVariable Long accountId) {
        myPageCommandService.deleteStudentProfileImage(accountId);
        return ApiResponse.ok(null);
    }

    @GetMapping(value = "/student/{accountId}/image")
    @PreAuthorize("hasAuthority('MYPAGE_MANAGE')")
    public ApiResponse<String> getStudentProfileImage(@PathVariable Long accountId) {
        String imageUrl = myPageQueryService.getStudentProfileImageUrl(accountId);
        return ApiResponse.ok(imageUrl);
    }
}
