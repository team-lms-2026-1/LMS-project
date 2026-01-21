package com.teamlms.backend.domain.mentoring.recruitment;

import com.teamlms.backend.domain.mentoring.recruitment.dto.*;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mentoring-recruitments")
public class MentoringRecruitmentController {

    private final MentoringRecruitmentService recruitmentService;

    @GetMapping
    public ApiResponse<List<RecruitmentListItem>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<RecruitmentListItem> p = recruitmentService.list(keyword, page, size);
        var meta = PageMeta.of(p, List.of("createdAt,desc"), null);
        return ApiResponse.ok(p.getContent(), meta);
    }

    @GetMapping("/{recruitmentId}")
    public ApiResponse<RecruitmentDetailResponse> detail(@PathVariable Long recruitmentId) {
        return ApiResponse.ok(recruitmentService.detail(recruitmentId));
    }

    @PostMapping
    public ApiResponse<?> create(@RequestBody RecruitmentCreateRequest req) {
        recruitmentService.create(req);
        return ApiResponse.success();
    }

    @PatchMapping("/{recruitmentId}")
    public ApiResponse<?> update(@PathVariable Long recruitmentId, @RequestBody RecruitmentUpdateRequest req) {
        recruitmentService.update(recruitmentId, req);
        return ApiResponse.success();
    }

    @DeleteMapping("/{recruitmentId}")
    public ApiResponse<?> delete(@PathVariable Long recruitmentId) {
        recruitmentService.delete(recruitmentId);
        return ApiResponse.success();
    }
}
