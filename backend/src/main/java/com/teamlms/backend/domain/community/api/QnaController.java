package com.teamlms.backend.domain.community.api;


import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.service.QnaService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/community/qna/questions")
@RequiredArgsConstructor
public class QnaController {

    private final QnaService qnaService;

    // --- 질문 API ---
    // =================================================================
    // 1. Q&A 질문 목록 조회 - 전부가능
    // =================================================================
    @GetMapping
    public ApiResponse<?> getList(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        Page<ExternalQnaResponse> result = qnaService.getQuestionList(pageable, categoryId, keyword);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // =================================================================
    // 2. Q&A 질문 상세목록 조회 - 전부가능
    // =================================================================
    @GetMapping("/{questionId}")
    public ApiResponse<?> getDetail(@PathVariable Long questionId) {
        return ApiResponse.ok(qnaService.getQuestionDetail(questionId));
    }
    
    // =================================================================
    // 3. Q&A 질문 등록 - 학생만 가능
    // =================================================================
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT')")
    public ApiResponse<?> createQuestion(@Valid @RequestBody ExternalQnaRequest request, @AuthenticationPrincipal AuthUser user) {
        Long id = qnaService.createQuestion(request, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true, "questionId", id));
    }

    // =================================================================
    // 4. Q&A 질문 수정 - 학생가능
    // =================================================================
    @PatchMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('STUDENT')")
    public ApiResponse<?> updateQuestion(@PathVariable Long questionId, @RequestBody ExternalQnaRequest request, @AuthenticationPrincipal AuthUser user) {
        qnaService.updateQuestion(questionId, request, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }
    
    // =================================================================
    // 5. Q&A 질문 삭제 - 학생, 어드민만 가능
    // =================================================================
    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ApiResponse<?> deleteQuestion(@PathVariable Long questionId, @AuthenticationPrincipal AuthUser user) {
            qnaService.deleteQuestion(questionId, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // --- 답변 API ---
    // =================================================================
    // 1. Q&A 답변 등록 - 어드민만 가능
    // =================================================================
    @PostMapping("/{questionId}/answer")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> createAnswer(@PathVariable Long questionId, @RequestBody ExternalAnswerRequest request, @AuthenticationPrincipal AuthUser user) {
        qnaService.createAnswer(questionId, request, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 2. Q&A 답변 수정 - 어드민만 가능
    // =================================================================
    @PatchMapping("/{questionId}/answer")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> updateAnswer(@PathVariable Long questionId, @RequestBody ExternalAnswerRequest request) {
        qnaService.updateAnswer(questionId, request);
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 3. Q&A 답변 삭제 - 어드민만 가능
    // =================================================================
    @DeleteMapping("/{questionId}/answer")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> deleteAnswer(@PathVariable Long questionId) {
        qnaService.deleteAnswer(questionId);
        return ApiResponse.ok(Map.of("success", true));
    }
}