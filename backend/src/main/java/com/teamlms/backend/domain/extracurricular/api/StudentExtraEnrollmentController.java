package com.teamlms.backend.domain.extracurricular.api;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraEnrollmentListItem;
import com.teamlms.backend.domain.extracurricular.service.ExtraEnrollmentCommandService;
import com.teamlms.backend.domain.extracurricular.service.ExtraEnrollmentQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student/extra-curriculars")
public class StudentExtraEnrollmentController {

    private final ExtraEnrollmentCommandService enrollmentCommandService;
    private final ExtraEnrollmentQueryService enrollmentQueryService;

    @PostMapping("/{offeringId}/enroll")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_CLASS')")
    public ApiResponse<SuccessResponse> enroll(
            @PathVariable Long offeringId,
            @AuthenticationPrincipal AuthUser authUser) {
        enrollmentCommandService.enroll(offeringId, authUser.getAccountId());
        return ApiResponse.ok(new SuccessResponse());
    }

    @PostMapping("/{offeringId}/cancel")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_CLASS')")
    public ApiResponse<SuccessResponse> cancel(
            @PathVariable Long offeringId,
            @AuthenticationPrincipal AuthUser authUser) {
        enrollmentCommandService.cancel(offeringId, authUser.getAccountId());
        return ApiResponse.ok(new SuccessResponse());
    }

    // 신청현황
    @GetMapping("/enrollList")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<List<StudentExtraEnrollmentListItem>> listEnrollments(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<StudentExtraEnrollmentListItem> result = enrollmentQueryService.listEnrollments(authUser.getAccountId(),
                pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 현재 이수중
    @GetMapping("/current-enrollments")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<List<StudentExtraEnrollmentListItem>> listCurrentEnrollments(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<StudentExtraEnrollmentListItem> result = enrollmentQueryService
                .listCurrentEnrollments(authUser.getAccountId(), pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}
