package com.teamlms.backend.domain.extracurricular.api;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingUserListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingItem;
import com.teamlms.backend.domain.extracurricular.service.ExtraCurricularOfferingQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserExtraCurricularOfferingController {

    private final ExtraCurricularOfferingQueryService extraCurricularOfferingQueryService;

    // 교과운영 목록 (학생/교수 공용)
    @GetMapping(value = { "/api/v1/student/extra-curricular/offerings",
            "/api/v1/professor/extra-curricular/offerings" })
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<List<ExtraCurricularOfferingUserListItem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ExtraCurricularOfferingUserListItem> result = extraCurricularOfferingQueryService.listForUser(keyword,
                pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 상세 기본
    @GetMapping(value = { "/api/v1/student/extra-curricular/offerings/{extraOfferingId}",
            "/api/v1/professor/extra-curricular/offerings/{extraOfferingId}" })
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<ExtraCurricularOfferingBasicDetailResponse> getBasicDetail(
            @org.springframework.security.core.annotation.AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long extraOfferingId) {
        return ApiResponse.ok(
                extraCurricularOfferingQueryService.getBasicDetailForStudent(authUser, extraOfferingId));
    }

    // 상세 역량
    @GetMapping(value = {
            "/api/v1/student/extra-curricular/offerings/{extraOfferingId}/competency-mapping",
            "/api/v1/professor/extra-curricular/offerings/{extraOfferingId}/competency-mapping"
    })
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ')")
    public ApiResponse<List<ExtraOfferingCompetencyMappingItem>> getCompetencyMapping(
            @org.springframework.security.core.annotation.AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long extraOfferingId) {
        return ApiResponse.ok(
                extraCurricularOfferingQueryService.getMappingForStudent(authUser, extraOfferingId));
    }
}
