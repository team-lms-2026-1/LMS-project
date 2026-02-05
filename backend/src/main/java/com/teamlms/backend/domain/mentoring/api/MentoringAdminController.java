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

import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentCreateRequest;

@RestController
@RequestMapping("/api/v1/admin/mentoring")
@RequiredArgsConstructor
public class MentoringAdminController {

    private final MentoringCommandService commandService;
    private final com.teamlms.backend.domain.mentoring.service.MentoringQueryService queryService;

    // [Admin] 멘토링 모집 공고 생성
    @PostMapping("/recruitments")
    public ResponseEntity<Long> createRecruitment(
            @AuthenticationPrincipal AuthUser admin,
            @RequestBody @Valid MentoringRecruitmentCreateRequest request) {
        Long id = commandService.createRecruitment(admin.getAccountId(), request);
        return ResponseEntity.ok(id);
    }

    // [Admin] 멘토링 모집 공고 수정
    @PutMapping("/recruitments/{id}")
    public ResponseEntity<Void> updateRecruitment(
            @AuthenticationPrincipal AuthUser admin,
            @PathVariable Long id,
            @RequestBody @Valid com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentUpdateRequest request) {
        commandService.updateRecruitment(admin.getAccountId(), id, request);
        return ResponseEntity.ok().build();
    }

    // [Admin] 멘토링 모집 공고 삭제
    @DeleteMapping("/recruitments/{id}")
    public ResponseEntity<Void> deleteRecruitment(
            @AuthenticationPrincipal AuthUser admin,
            @PathVariable Long id) {
        commandService.deleteRecruitment(admin.getAccountId(), id);
        return ResponseEntity.ok().build();
    }

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

    // [Admin] 멘토링 신청 목록 조회
    @GetMapping("/recruitments/{id}/applications")
    public ResponseEntity<java.util.List<com.teamlms.backend.domain.mentoring.api.dto.MentoringApplicationResponse>> getApplications(
            @PathVariable Long id) {
        return ResponseEntity.ok(queryService.getApplications(id));
    }
}
