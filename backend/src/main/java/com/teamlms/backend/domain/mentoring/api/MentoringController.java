package com.teamlms.backend.domain.mentoring.api;

import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentCreateRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentResponse;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringApplicationRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringQuestionRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringAnswerRequest;
import com.teamlms.backend.domain.mentoring.service.MentoringCommandService;
import com.teamlms.backend.domain.mentoring.service.MentoringQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MentoringController {

    private final MentoringCommandService commandService;
    private final MentoringQueryService queryService;

    // [Admin/User] 멘토링 모집 목록 조회
    @GetMapping("/mentoring/recruitments")
    public ApiResponse<java.util.List<MentoringRecruitmentResponse>> getRecruitments(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus status,
            @PageableDefault(sort = "recruitmentId", direction = Sort.Direction.DESC) Pageable pageable) {
        Long accountId = (user != null) ? user.getAccountId() : null;
        Page<MentoringRecruitmentResponse> result = queryService.getRecruitments(pageable, accountId, keyword, status);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // [Admin/User] 멘토링 모집 상세 조회
    @GetMapping("/mentoring/recruitments/{id}")
    public ApiResponse<MentoringRecruitmentResponse> getRecruitment(@PathVariable Long id) {
        return ApiResponse.ok(queryService.getRecruitment(id));
    }

    // [User] 멘토링 신청 (멘토/멘티)
    @PostMapping("/mentoring/applications")
    public ApiResponse<SuccessResponse> applyMentoring(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid MentoringApplicationRequest request) {
        commandService.applyMentoring(user.getAccountId(), request);
        return ApiResponse.ok(new SuccessResponse());
    }

    // [User] 멘토링 질문 등록
    @PostMapping("/mentoring/questions")
    public ApiResponse<SuccessResponse> createQuestion(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid MentoringQuestionRequest request) {
        commandService.createQuestion(user.getAccountId(), request);
        return ApiResponse.ok(new SuccessResponse());
    }

    // [User] 내 멘토링 매칭 목록 조회
    @GetMapping("/mentoring/matchings")
    public ApiResponse<java.util.List<com.teamlms.backend.domain.mentoring.api.dto.MentoringMatchingResponse>> getMyMatchings(
            @AuthenticationPrincipal AuthUser user) {
        return ApiResponse.ok(queryService.getMyMatchings(user.getAccountId()));
    }

    // [User] 멘토링 채팅 내역 조회
    @GetMapping("/mentoring/matchings/{id}/chat")
    public ApiResponse<java.util.List<com.teamlms.backend.domain.mentoring.api.dto.MentoringChatMessageResponse>> getChatHistory(
            @PathVariable Long id) {
        return ApiResponse.ok(queryService.getChatHistory(id));
    }

    // [User] 멘토링 답변 등록
    @PostMapping("/mentoring/answers")
    public ApiResponse<SuccessResponse> createAnswer(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid MentoringAnswerRequest request) {
        commandService.createAnswer(user.getAccountId(), request);
        return ApiResponse.ok(new SuccessResponse());
    }

    // [Admin] endpoints removed (moved to MentoringAdminController)
}
