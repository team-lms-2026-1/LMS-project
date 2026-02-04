package com.teamlms.backend.domain.mentoring.api;

import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentCreateRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentResponse;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringApplicationRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringQuestionRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringAnswerRequest;
import com.teamlms.backend.domain.mentoring.service.MentoringCommandService;
import com.teamlms.backend.domain.mentoring.service.MentoringQueryService;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MentoringController {

    private final MentoringCommandService commandService;
    private final MentoringQueryService queryService;

    // [Admin] 멘토링 모집 공고 생성
    @PostMapping("/admin/mentoring/recruitments")
    public ResponseEntity<Long> createRecruitment(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid MentoringRecruitmentCreateRequest request) {
        Long id = commandService.createRecruitment(user.getAccountId(), request);
        return ResponseEntity.ok(id);
    }

    // [Admin/User] 멘토링 모집 목록 조회
    @GetMapping("/mentoring/recruitments")
    public ResponseEntity<Page<MentoringRecruitmentResponse>> getRecruitments(Pageable pageable) {
        return ResponseEntity.ok(queryService.getRecruitments(pageable));
    }

    // [Admin/User] 멘토링 모집 상세 조회
    @GetMapping("/mentoring/recruitments/{id}")
    public ResponseEntity<MentoringRecruitmentResponse> getRecruitment(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.getRecruitment(id));
    }

    // [User] 멘토링 신청 (멘토/멘티)
    @PostMapping("/mentoring/applications")
    public ResponseEntity<Void> applyMentoring(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid MentoringApplicationRequest request) {
        commandService.applyMentoring(user.getAccountId(), request);
        return ResponseEntity.ok().build();
    }

    // [User] 멘토링 질문 등록
    @PostMapping("/mentoring/questions")
    public ResponseEntity<Void> createQuestion(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid MentoringQuestionRequest request) {
        commandService.createQuestion(user.getAccountId(), request);
        return ResponseEntity.ok().build();
    }

    // [User] 멘토링 답변 등록
    @PostMapping("/mentoring/answers")
    public ResponseEntity<Void> createAnswer(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid MentoringAnswerRequest request) {
        commandService.createAnswer(user.getAccountId(), request);
        return ResponseEntity.ok().build();
    }
}
