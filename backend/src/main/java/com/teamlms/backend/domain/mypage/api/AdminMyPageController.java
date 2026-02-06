package com.teamlms.backend.domain.mypage.api;

import com.teamlms.backend.domain.mypage.service.MyPageCommandService;
import com.teamlms.backend.global.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Admin MyPage", description = "관리자 마이페이지 관리 API")
@RestController
@RequestMapping("/api/v1/admin/mypage")
@RequiredArgsConstructor
public class AdminMyPageController {

    private final MyPageCommandService myPageCommandService;

    @Operation(summary = "학생 프로필 이미지 업로드", description = "관리자가 학생의 프로필 이미지를 업로드합니다.")
    @PostMapping(value = "/student/{accountId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('MYPAGE_MANAGE')")
    public ApiResponse<String> uploadStudentProfileImage(
            @PathVariable Long accountId,
            @RequestPart("file") MultipartFile file) {
        String imageUrl = myPageCommandService.uploadStudentProfileImage(accountId, file);
        return ApiResponse.ok(imageUrl);
    }

    @Operation(summary = "학생 프로필 이미지 삭제", description = "관리자가 학생의 프로필 이미지를 삭제합니다.")
    @DeleteMapping(value = "/student/{accountId}/image")
    @PreAuthorize("hasAuthority('MYPAGE_MANAGE')")
    public ApiResponse<Void> deleteStudentProfileImage(@PathVariable Long accountId) {
        myPageCommandService.deleteStudentProfileImage(accountId);
        return ApiResponse.ok(null);
    }
}
