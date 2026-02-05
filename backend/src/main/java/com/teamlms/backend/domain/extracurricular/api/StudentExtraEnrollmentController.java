package com.teamlms.backend.domain.extracurricular.api;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.extracurricular.service.ExtraEnrollmentCommandService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student/extra-curriculars")
public class StudentExtraEnrollmentController {

    private final ExtraEnrollmentCommandService enrollmentCommandService;

    @PostMapping("/{offeringId}/enroll")
    public ApiResponse<SuccessResponse> enroll(
        @PathVariable Long offeringId,
        @AuthenticationPrincipal AuthUser authUser
    ) {
        enrollmentCommandService.enroll(offeringId, authUser.getAccountId());
        return ApiResponse.ok(new SuccessResponse());
    }

    @PostMapping("/{offeringId}/cancel")
    public ApiResponse<SuccessResponse> cancel(
        @PathVariable Long offeringId,
        @AuthenticationPrincipal AuthUser authUser
    ) {
        enrollmentCommandService.cancel(offeringId, authUser.getAccountId());
        return ApiResponse.ok(new SuccessResponse());
    }
}
