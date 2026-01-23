package com.teamlms.backend.domain.curricular.api;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.teamlms.backend.domain.curricular.service.EnrollmentCommandService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student/curriculars")
public class StudentEnrollmentController {

    private final EnrollmentCommandService enrollmentCommandService;

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
