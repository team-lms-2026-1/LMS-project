package com.teamlms.backend.domain.mentoring.batch;

import com.teamlms.backend.domain.mentoring.batch.dto.BatchCommitRequest;
import com.teamlms.backend.global.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mentoring-batch")
public class MentoringBatchController {

    private final MentoringBatchService batchService;

    @GetMapping("/semesters")
    public ApiResponse<?> semesters() {
        return ApiResponse.ok(batchService.semesters());
    }

    @GetMapping("/recruitments")
    public ApiResponse<?> recruitments(@RequestParam Long semesterId) {
        return ApiResponse.ok(batchService.closedRecruitments(semesterId));
    }

    @GetMapping("/recruitments/{recruitmentId}")
    public ApiResponse<?> detail(@PathVariable Long recruitmentId) {
        return ApiResponse.ok(batchService.detail(recruitmentId));
    }

    @PostMapping("/recruitments/{recruitmentId}/commit")
    public ApiResponse<?> commit(@PathVariable Long recruitmentId, @RequestBody BatchCommitRequest req) {
        batchService.commit(recruitmentId, req);
        return ApiResponse.success();
    }
}
