package com.teamlms.backend.domain.curricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUserListItem;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem;
import com.teamlms.backend.domain.curricular.service.CurricularOfferingQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserCurricularOfferingController {

    private final CurricularOfferingQueryService curricularOfferingQueryService;

    @GetMapping(value = {"/api/v1/student/curriculars", "/api/v1/professor/curriculars"})
    public ApiResponse<List<CurricularOfferingUserListItem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @AuthenticationPrincipal AuthUser authUser
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Long professorAccountId = isProfessor(authUser) ? authUser.getAccountId() : null;

        Page<CurricularOfferingUserListItem> result =
                curricularOfferingQueryService.listForUser(keyword, professorAccountId, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    @GetMapping(value = {"/api/v1/student/curriculars/{offeringId}", "/api/v1/professor/curriculars/{offeringId}"})
    public ApiResponse<CurricularOfferingDetailResponse> detail(
            @PathVariable Long offeringId,
            @AuthenticationPrincipal AuthUser authUser
    ) {
        CurricularOfferingDetailResponse detail = isProfessor(authUser)
                ? curricularOfferingQueryService.getDetailForProfessor(authUser.getAccountId(), offeringId)
                : curricularOfferingQueryService.getDetail(offeringId);

        return ApiResponse.ok(detail);
    }

    @GetMapping(value = {
            "/api/v1/student/curriculars/{offeringId}/competency-mapping",
            "/api/v1/professor/curriculars/{offeringId}/competency-mapping"
    })
    public ApiResponse<List<OfferingCompetencyMappingItem>> getMapping(
            @PathVariable Long offeringId,
            @AuthenticationPrincipal AuthUser authUser
    ) {
        List<OfferingCompetencyMappingItem> mapping = isProfessor(authUser)
                ? curricularOfferingQueryService.getMappingForProfessor(authUser.getAccountId(), offeringId)
                : curricularOfferingQueryService.getMapping(offeringId);

        return ApiResponse.ok(mapping);
    }

    private boolean isProfessor(AuthUser authUser) {
        return authUser != null && "PROFESSOR".equals(authUser.getAccountType());
    }
}
