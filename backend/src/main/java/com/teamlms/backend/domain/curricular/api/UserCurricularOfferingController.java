package com.teamlms.backend.domain.curricular.api;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUserListItem;
import com.teamlms.backend.domain.curricular.service.CurricularOfferingQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserCurricularOfferingController {

    private final CurricularOfferingQueryService curricularOfferingQueryService;

    // 교과운영 목록 (학생/교수 공용)
    @GetMapping(value = {"/api/v1/student/curriculars", "/api/v1/professor/curriculars"})
    public ApiResponse<List<CurricularOfferingUserListItem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<CurricularOfferingUserListItem> result =
                curricularOfferingQueryService.listForUser(keyword, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}

