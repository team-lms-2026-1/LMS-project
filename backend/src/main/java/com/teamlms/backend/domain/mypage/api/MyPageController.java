package com.teamlms.backend.domain.mypage.api;

import com.teamlms.backend.domain.mypage.api.dto.StudentMypageResponse;
import com.teamlms.backend.domain.mypage.service.MyPageQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageQueryService myPageQueryService;

    @GetMapping({ "/api/v1/student/mypage",
            "/api/v1/admin/mypage" }) // ?year=2024&term=FIRST 문이 없으면 현재 활성화된 학기의 시간표를 조회 쿼리문이 있으면 과거의 시간표 조회
    @PreAuthorize("hasAuthority('MYPAGE_READ')")
    public ApiResponse<StudentMypageResponse> getStudentMyPage(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String term) {
        StudentMypageResponse response = myPageQueryService.getStudentMyPage(authUser.getAccountId(), year, term);
        return ApiResponse.ok(response);
    }
}
