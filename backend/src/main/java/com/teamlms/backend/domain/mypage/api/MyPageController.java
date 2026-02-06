package com.teamlms.backend.domain.mypage.api;

import com.teamlms.backend.domain.mypage.api.dto.StudentMypageResponse;
import com.teamlms.backend.domain.mypage.service.MyPageQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.principal.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "MyPage", description = "마이페이지 관련 API")
@RestController
@RequestMapping // ("/api/v1/student/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageQueryService myPageQueryService;

    @Operation(summary = "학생 마이페이지 조회", description = "로그인한 학생의 마이페이지 종합 정보를 조회합니다. (연도/학기 선택 시 해당 학기 시간표 조회)")
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
