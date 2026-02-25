package com.teamlms.backend.domain.extracurricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCompletionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraGradeDetailHeaderResponse;
import com.teamlms.backend.domain.extracurricular.service.StudentExtraGradeReportQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student/extra-curricular/grade-reports")
public class StudentExtraGradeReportController {

    private final StudentExtraGradeReportQueryService studentExtraGradeReportQueryService;

    // 1) 비교과 성적 헤더 + 추이
    @GetMapping("/me")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<StudentExtraGradeDetailHeaderResponse> meHeader(
            @AuthenticationPrincipal AuthUser user) {
        Long studentAccountId = user.getAccountId();
        return ApiResponse.ok(studentExtraGradeReportQueryService.getDetailHeader(studentAccountId));
    }

    // 2) 비교과 수료 리스트
    @GetMapping("/me/list")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<List<StudentExtraCompletionListItem>> meList(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        Long studentAccountId = user.getAccountId();

        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "semesterId"));

        Page<StudentExtraCompletionListItem> result = studentExtraGradeReportQueryService
                .listCompletions(studentAccountId, semesterId, pageable, keyword);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}
