package com.teamlms.backend.domain.curricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.curricular.api.dto.EnrollListItem;
import com.teamlms.backend.domain.curricular.service.EnrollmentCommandService;
import com.teamlms.backend.domain.curricular.service.EnrollmentQueryService;
import com.teamlms.backend.domain.semester.api.dto.SemesterListItem;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student/curriculars")
public class StudentEnrollmentController {

    private final EnrollmentCommandService enrollmentCommandService;
    private final EnrollmentQueryService enrollmentQueryService;

    // 수강 신청 버튼
    @PostMapping("/{offeringId}/enroll")
    @PreAuthorize("hasAuthority('CURRICULAR_CLASS')")
    public ApiResponse<SuccessResponse> enroll(
            @PathVariable Long offeringId,
            @AuthenticationPrincipal AuthUser authUser) {
        enrollmentCommandService.enroll(offeringId, authUser.getAccountId());
        return ApiResponse.ok(new SuccessResponse());
    }

    // 수강 취소 버튼
    @PostMapping("/{offeringId}/cancel")
    @PreAuthorize("hasAuthority('CURRICULAR_CLASS')")
    public ApiResponse<SuccessResponse> cancel(
            @PathVariable Long offeringId,
            @AuthenticationPrincipal AuthUser authUser) {
        enrollmentCommandService.cancel(offeringId, authUser.getAccountId());
        return ApiResponse.ok(new SuccessResponse());
    }

    // 신청현황
    @GetMapping("/enrollList")
    @PreAuthorize("hasAuthority('CURRICULAR_READ')")
    public ApiResponse<List<EnrollListItem>> listEnrollments(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long accountId = authUser.getAccountId();

        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<EnrollListItem> result = enrollmentQueryService.listEnrollments(accountId, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 수강중 교과
    @GetMapping("/current-enrollments")
    @PreAuthorize("hasAuthority('CURRICULAR_READ')")
    public ApiResponse<List<EnrollListItem>> listCurrentEnrollments(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long accountId = authUser.getAccountId();

        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<EnrollListItem> result = enrollmentQueryService.listCurrentEnrollments(accountId, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}
