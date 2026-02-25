package com.teamlms.backend.domain.extracurricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCurricularSessionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraSessionAttendanceRequest;
import com.teamlms.backend.domain.extracurricular.service.StudentExtraCurricularSessionCommandService;
import com.teamlms.backend.domain.extracurricular.service.StudentExtraCurricularSessionQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student/extra-curricular/offerings")
public class StudentExtraCurricularSessionController {

    private final StudentExtraCurricularSessionQueryService queryService;
    private final StudentExtraCurricularSessionCommandService commandService;

    // 세션 목록 (학생)
    @GetMapping("/{extraOfferingId}/sessions")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<List<StudentExtraCurricularSessionListItem>> getSessionList(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long extraOfferingId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(safePage - 1, safeSize);

        Page<StudentExtraCurricularSessionListItem> result = queryService.list(
                authUser.getAccountId(), // 너희 AuthUser getter에 맞춰 수정
                extraOfferingId,
                keyword,
                pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    @GetMapping("/{extraOfferingId}/sessions/{sessionId}")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<ExtraCurricularSessionDetailResponse> getDetail(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long extraOfferingId,
            @PathVariable Long sessionId) {
        return ApiResponse.ok(
                queryService.getDetail(authUser.getAccountId(), extraOfferingId, sessionId));
    }

    @PostMapping("/{extraOfferingId}/sessions/{sessionId}/attendance")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_CLASS')")
    public ApiResponse<SuccessResponse> markAttendance(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long extraOfferingId,
            @PathVariable Long sessionId,
            @Valid @RequestBody StudentExtraSessionAttendanceRequest req) {
        commandService.markAttended(
                authUser.getAccountId(), // 너희 AuthUser getter에 맞춰 수정
                extraOfferingId,
                sessionId,
                req);
        return ApiResponse.ok(new SuccessResponse());
    }
}
