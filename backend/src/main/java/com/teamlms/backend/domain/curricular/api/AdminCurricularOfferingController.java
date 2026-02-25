package com.teamlms.backend.domain.curricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingCreateRequest;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingStatusChangeRequest;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUpdateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingBulkUpdateRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingPatchRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingScorePatchRequest;
import com.teamlms.backend.domain.curricular.api.dto.OfferingStudentListItem;
import com.teamlms.backend.domain.curricular.service.CurricularOfferingCommandService;
import com.teamlms.backend.domain.curricular.service.CurricularOfferingQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/curricular-offerings")
public class AdminCurricularOfferingController {

    private final CurricularOfferingCommandService curricularOfferingCommandService;
    private final CurricularOfferingQueryService curricularOfferingQueryService;
    
    // 생성
    @PostMapping
    public ApiResponse<SuccessResponse> create(
        @Valid @RequestBody CurricularOfferingCreateRequest req
    ) {
        curricularOfferingCommandService.create(
            req.offeringCode(),
            req.curricularId(),
            req.semesterId(),
            req.dayOfWeek(),
            req.period(),
            req.capacity(),
            req.location(),
            req.professorAccountId()
        );

        return ApiResponse.ok(new SuccessResponse());
    }

    // 목록
    @GetMapping
    public ApiResponse<List<CurricularOfferingListItem>> list(
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

        Page<CurricularOfferingListItem> result =
                curricularOfferingQueryService.listForAdmin(semesterId, keyword, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
    
    // 상세 ( 기본 )
    @GetMapping("/{offeringId}")
    public ApiResponse<CurricularOfferingDetailResponse> detail(
        @PathVariable Long offeringId
    ) {
        return ApiResponse.ok(
        curricularOfferingQueryService.getDetail(offeringId)
        );
    }

    // 상태변경
    @PatchMapping("/{offeringId}/status")
    public ApiResponse<SuccessResponse> changeStatus(
            @PathVariable Long offeringId,
            @Valid @RequestBody CurricularOfferingStatusChangeRequest req,
            @AuthenticationPrincipal AuthUser authUser
    ) {
        curricularOfferingCommandService.changeStatus(offeringId, req.status(), authUser.getAccountId());
         return ApiResponse.ok(new SuccessResponse());
    }

    // 기본수정
    @PatchMapping("/{offeringId}/basic")
    public ApiResponse<SuccessResponse> patchBasic(
            @PathVariable Long offeringId,
            @Valid @RequestBody CurricularOfferingUpdateRequest req
    ) {
        curricularOfferingCommandService.patchBasic(offeringId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 상세 ( 학생 )
    @GetMapping("/{offeringId}/students")
    public ApiResponse<List<OfferingStudentListItem>> list(
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
                Sort.by(Sort.Direction.DESC, "appliedAt") // 신청 최신순 추천
        );

        Page<OfferingStudentListItem> result =
                curricularOfferingQueryService.listStudents(offeringId, keyword, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
    // 상세 ( 학생 성적 입력 )
    @PatchMapping("/{offeringId}/students/{enrollmentId}/score")
    public ApiResponse<SuccessResponse> patchScore(
        @AuthenticationPrincipal AuthUser user,
        @PathVariable Long offeringId,
        @PathVariable Long enrollmentId,
        @Valid @RequestBody OfferingScorePatchRequest req
    ) {
        curricularOfferingCommandService.patchScore(
            offeringId,
            enrollmentId,
            req.rawScore(),
            user == null ? null : user.getAccountId()
        );
        return ApiResponse.ok(new SuccessResponse());
    }

    // 상세 ( 역량 맵핑 )
    @GetMapping("/{offeringId}/competency-mapping")
    public ApiResponse<List<OfferingCompetencyMappingItem>> getMapping(
            @PathVariable Long offeringId
    ) {
        return ApiResponse.ok(curricularOfferingQueryService.getMapping(offeringId));
    }

    // 상세 ( 역량 맵핑 )
    @PatchMapping("/{offeringId}/competency-mapping")
    public ApiResponse<SuccessResponse> patchMapping(
            @PathVariable Long offeringId,
            @Valid @RequestBody OfferingCompetencyMappingBulkUpdateRequest req
    ) {
        curricularOfferingCommandService.patchMapping(offeringId, req);
        return ApiResponse.ok(new SuccessResponse());
    }
}
