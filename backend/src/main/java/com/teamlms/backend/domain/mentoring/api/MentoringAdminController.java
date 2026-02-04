package com.teamlms.backend.domain.mentoring.api;

import com.teamlms.backend.domain.mentoring.api.dto.MentoringMatchingRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringStatusUpdateRequest;
import com.teamlms.backend.domain.mentoring.service.MentoringCommandService;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/mentoring")
@RequiredArgsConstructor
public class MentoringAdminController {

    private final MentoringCommandService commandService;

    // [Admin] 멘토링 신청 상태 변경 (승인/반려)
    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<Void> updateApplicationStatus(
            @AuthenticationPrincipal AuthUser admin,
            @PathVariable Long id,
            @RequestBody @Valid MentoringStatusUpdateRequest request) {
        commandService.updateApplicationStatus(admin.getAccountId(), id, request);
        return ResponseEntity.ok().build();
    }

    // [Admin] 멘토링 매칭
    @PostMapping("/match")
    public ResponseEntity<Void> matchMentoring(
            @AuthenticationPrincipal AuthUser admin,
            @RequestBody @Valid MentoringMatchingRequest request) {
        commandService.match(admin.getAccountId(), request);
        return ResponseEntity.ok().build();
    }
}
