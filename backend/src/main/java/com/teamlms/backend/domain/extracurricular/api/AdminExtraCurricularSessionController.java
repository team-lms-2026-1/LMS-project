package com.teamlms.backend.domain.extracurricular.api;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraSessionVideoPresignRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraSessionVideoPresignResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionUpdateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraSessionStatusChangeRequest;
import com.teamlms.backend.domain.extracurricular.service.AdminExtraCurricularSessionCommandService;
import com.teamlms.backend.domain.extracurricular.service.AdminExtraSessionVideoPresignService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.dto.SuccessResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/extra-curricular/offerings")
@Validated
public class AdminExtraCurricularSessionController {

    private final AdminExtraCurricularSessionCommandService adminSessionCommandService;
    private final AdminExtraSessionVideoPresignService presignService;

    // 1) presign 발급
    @PostMapping("/{extraOfferingId}/sessions/presign")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_MANAGE') or hasRole('ADMIN')")
    public ApiResponse<ExtraSessionVideoPresignResponse> presignSessionVideoUpload(
            @PathVariable Long extraOfferingId,
            @Valid @RequestBody ExtraSessionVideoPresignRequest req) {
        return ApiResponse.ok(presignService.presign(extraOfferingId, req));
    }

    // 2) 세션 생성
    @PostMapping("/{extraOfferingId}/sessions")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_MANAGE') or hasRole('ADMIN')")
    public ApiResponse<SuccessResponse> createSession(
            @PathVariable Long extraOfferingId,
            @Valid @RequestBody ExtraCurricularSessionCreateRequest req) {
        adminSessionCommandService.create(extraOfferingId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 3) 세션 수정
    @PatchMapping("/{extraOfferingId}/sessions/{sessionId}")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_MANAGE') or hasRole('ADMIN')")
    public ApiResponse<SuccessResponse> updateSession(
            @PathVariable Long extraOfferingId,
            @PathVariable Long sessionId,
            @Valid @RequestBody ExtraCurricularSessionUpdateRequest req) {
        adminSessionCommandService.updateSession(extraOfferingId, sessionId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    @PatchMapping("/{offeringId}/sessions/{sessionId}/status")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_MANAGE') or hasRole('ADMIN')")
    public ApiResponse<SuccessResponse> changeSessionStatus(
            @PathVariable Long offeringId,
            @PathVariable Long sessionId,
            @Valid @RequestBody ExtraSessionStatusChangeRequest req) {
        adminSessionCommandService.changeStatus(offeringId, sessionId, req.targetStatus());
        return ApiResponse.ok(new SuccessResponse());
    }
}
