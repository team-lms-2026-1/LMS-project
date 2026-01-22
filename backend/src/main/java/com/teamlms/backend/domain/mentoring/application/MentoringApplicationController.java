package com.teamlms.backend.domain.mentoring.application;

import com.teamlms.backend.domain.mentoring.application.dto.RejectRequest;
import com.teamlms.backend.global.api.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mentoring-applications")
public class MentoringApplicationController {

    private final MentoringApplicationService applicationService;

    @GetMapping
    public ApiResponse<?> list(
            @RequestParam(required = false) Long recruitmentId,
            @RequestParam(required = false) ApplicationRole role,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<?> p = applicationService.list(recruitmentId, role, status, keyword, page, size);

        Object stats = (recruitmentId == null) ? null : applicationService.stats(recruitmentId);
        PageMeta meta = PageMeta.from(p, stats);

        return ApiResponse.ok(p.getContent(), meta);
    }

    @PostMapping("/{applicationId}/approve")
    public ApiResponse<?> approve(@PathVariable Long applicationId) {
        applicationService.approve(applicationId);
        return ApiResponse.success();
    }

    @PostMapping("/{applicationId}/reject")
    public ApiResponse<?> reject(@PathVariable Long applicationId, @RequestBody RejectRequest req) {
        applicationService.reject(applicationId, req.rejectReason());
        return ApiResponse.success();
    }
}
