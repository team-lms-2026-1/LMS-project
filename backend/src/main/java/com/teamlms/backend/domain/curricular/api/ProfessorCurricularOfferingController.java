package com.teamlms.backend.domain.curricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem;
import com.teamlms.backend.domain.curricular.api.dto.OfferingStudentListItem;
import com.teamlms.backend.domain.curricular.service.CurricularOfferingQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/professor/curricular-offerings")
public class ProfessorCurricularOfferingController {

    private final CurricularOfferingQueryService curricularOfferingQueryService;

    @GetMapping
    public ApiResponse<List<CurricularOfferingListItem>> list(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<CurricularOfferingListItem> result = curricularOfferingQueryService.listForProfessor(
                authUser.getAccountId(),
                semesterId,
                keyword,
                pageable
        );

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    @GetMapping("/{offeringId}")
    public ApiResponse<CurricularOfferingDetailResponse> detail(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long offeringId
    ) {
        return ApiResponse.ok(
                curricularOfferingQueryService.getDetailForProfessor(authUser.getAccountId(), offeringId)
        );
    }

    @GetMapping("/{offeringId}/students")
    public ApiResponse<List<OfferingStudentListItem>> listStudents(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long offeringId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "appliedAt")
        );

        Page<OfferingStudentListItem> result = curricularOfferingQueryService.listStudentsForProfessor(
                authUser.getAccountId(),
                offeringId,
                keyword,
                pageable
        );

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    @GetMapping("/{offeringId}/competency-mapping")
    public ApiResponse<List<OfferingCompetencyMappingItem>> getMapping(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long offeringId
    ) {
        return ApiResponse.ok(
                curricularOfferingQueryService.getMappingForProfessor(authUser.getAccountId(), offeringId)
        );
    }
}
