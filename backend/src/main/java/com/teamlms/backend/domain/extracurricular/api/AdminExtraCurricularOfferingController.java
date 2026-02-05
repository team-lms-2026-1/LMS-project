package com.teamlms.backend.domain.extracurricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingCreateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingBulkUpdateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingBasicDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingPatchRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionCreateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionDetailResponse;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularSessionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingBulkUpdateRequest;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingStatusChangeRequest;
import com.teamlms.backend.domain.extracurricular.service.AdminExtraCurricularSessionCommandService;
import com.teamlms.backend.domain.extracurricular.service.AdminExtraCurricularSessionQueryService;
import com.teamlms.backend.domain.extracurricular.service.ExtraCurricularOfferingCommandService;
import com.teamlms.backend.domain.extracurricular.service.ExtraCurricularOfferingQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/extra-curricular/offerings")
public class AdminExtraCurricularOfferingController {
    
    private final ExtraCurricularOfferingCommandService extraCurricularOfferingCommandService;
    private final ExtraCurricularOfferingQueryService extracurricularOfferingQueryService;
    private final AdminExtraCurricularSessionCommandService adminSessionCommandService;
    private final AdminExtraCurricularSessionQueryService adminExtraCurricularSessionQueryService;

    // 목록
    @GetMapping
    public ApiResponse<List<ExtraCurricularOfferingListItem>> getList(
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
            Sort.by(Sort.Direction.ASC, "extraOfferingCode")
        );

        Page<ExtraCurricularOfferingListItem> result =
            extracurricularOfferingQueryService.list(semesterId, keyword, pageable);

        return ApiResponse.of(
            result.getContent(),
            PageMeta.from(result)
        );
    }

    // 생성
    @PostMapping
    public ApiResponse<SuccessResponse> create(
        @Valid @RequestBody ExtraCurricularOfferingCreateRequest req
    ) {
        extraCurricularOfferingCommandService.create(req);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 수정
    @PatchMapping("/{extraOfferingId}/basic")
    public ApiResponse<SuccessResponse> patchBasic(
        @PathVariable Long extraOfferingId,
        @Valid @RequestBody ExtraCurricularOfferingPatchRequest req
    ) {
        extraCurricularOfferingCommandService.patch(extraOfferingId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 상태변경
    @PatchMapping("/{extraOfferingId}/status")
    public ApiResponse<SuccessResponse> changeStatus(
            @PathVariable Long extraOfferingId,
            @Validated @RequestBody ExtraOfferingStatusChangeRequest req
    ) {
        extraCurricularOfferingCommandService.changeStatus(extraOfferingId, req.targetStatus());
        return ApiResponse.ok(new SuccessResponse());
    }

    // 상세 기본
    @GetMapping("/{extraOfferingId}")
    public ApiResponse<ExtraCurricularOfferingBasicDetailResponse> getBasicDetail(
        @PathVariable Long extraOfferingId
    ) {
        return ApiResponse.ok(extracurricularOfferingQueryService.getBasicDetail(extraOfferingId));
    }

    // 세션 생성
    @PostMapping("/{extraOfferingId}/sessions")
    public ApiResponse<SuccessResponse> createSession(
        @PathVariable Long extraOfferingId,
        @Valid @RequestBody ExtraCurricularSessionCreateRequest req
    ) {
        adminSessionCommandService.create(extraOfferingId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 세션 목록
    @GetMapping("/{extraOfferingId}/sessions")
    public ApiResponse<List<ExtraCurricularSessionListItem>> getSessionList(
        @PathVariable Long extraOfferingId,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
            safePage - 1,
            safeSize
            // 정렬은 JPQL order by로 이미 처리해서 생략해도 되지만,
            // 혹시 모를 통일감 때문에 넣고 싶다면 startAt 정렬 컬럼이 엔티티에 있어야 함.
        );

        Page<ExtraCurricularSessionListItem> result =
            adminExtraCurricularSessionQueryService.list(extraOfferingId, keyword, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 세션 상세
    @GetMapping("/{extraOfferingId}/sessions/{sessionId}")
    public ApiResponse<ExtraCurricularSessionDetailResponse> getSessionDetail(
        @PathVariable Long extraOfferingId,
        @PathVariable Long sessionId
    ) {
        return ApiResponse.ok(
            adminExtraCurricularSessionQueryService.getDetail(extraOfferingId, sessionId)
        );
    }

    // 상세 ( 역량 맵핑 )
    @GetMapping("/{extraOfferingId}/competency-mapping")
    public ApiResponse<List<ExtraOfferingCompetencyMappingItem>> getMapping(
            @PathVariable Long extraOfferingId
    ) {
        return ApiResponse.ok(extracurricularOfferingQueryService.getMapping(extraOfferingId));
    }

    // 상세 ( 역량 맵핑 )
    @PatchMapping("/{extraOfferingId}/competency-mapping")
    public ApiResponse<SuccessResponse> patchMapping(
            @PathVariable Long extraOfferingId,
            @Valid @RequestBody ExtraOfferingCompetencyMappingBulkUpdateRequest req
    ) {
        extraCurricularOfferingCommandService.patchMapping(extraOfferingId, req);
        return ApiResponse.ok(new SuccessResponse());
    }
}
