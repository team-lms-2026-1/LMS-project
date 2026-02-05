package com.teamlms.backend.domain.community.api;

import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.service.QnaService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping // ("/api/v1/community/qna/questions")
@RequiredArgsConstructor
public class QnaController {

    private final QnaService qnaService;

    // =================================================================
    // 1. Q&A 질문 목록 조회 - 전부가능
    // =================================================================

    @GetMapping({ "/api/v1/student/community/qna/questions",
            "/api/v1/professor/community/qna/questions",
            "/api/v1/admin/community/qna/questions"
    })
    @PreAuthorize("hasAuthority('NOTICE_READ')") // 권한 설정 확인 필요 (QNA_READ 등)
    public ApiResponse<List<ExternalQnaResponse>> getQuestions(
            @RequestParam(defaultValue = "1") int page, // 프론트 1페이지 시작
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        // 1. 페이지 및 사이즈 유효성 검사 (안전장치)
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        // 2. PageRequest 생성 (1페이지 -> 0페이지 변환 및 최신순 정렬)
        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        // 3. 서비스 호출 (qnaService 사용)
        Page<ExternalQnaResponse> pageResult = qnaService.getQuestionList(pageable, categoryId, keyword);
        // 4. 공통 규격으로 응답
        return ApiResponse.of(
                pageResult.getContent(),
                PageMeta.from(pageResult));
    }

    // =================================================================
    // 2. Q&A 질문 상세목록 조회 - 전부가능
    // =================================================================
    @GetMapping({ "/api/v1/student/community/qna/questions/{questionId}",
            "/api/v1/professor/community/qna/questions/{questionId}",
            "/api/v1/admin/community/qna/questions/{questionId}"
    })
    @PreAuthorize("hasAuthority('NOTICE_READ')")
    public ApiResponse<?> getDetail(@PathVariable Long questionId) {
        return ApiResponse.ok(qnaService.getQuestionDetail(questionId));
    }

    // =================================================================
    // 3. Q&A 질문 등록 - 학생만 가능
    // =================================================================
    @PostMapping("/api/v1/student/community/qna/questions")
    @PreAuthorize("hasAuthority('QNA_CREATE')")
    public ApiResponse<?> createQuestion(@Valid @RequestBody ExternalQnaRequest request,
            @AuthenticationPrincipal AuthUser user) {
        Long id = qnaService.createQuestion(request, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true, "questionId", id));
    }

    // =================================================================
    // 4. Q&A 질문 수정 - 학생가능
    // =================================================================
    @PatchMapping("/api/v1/student/community/qna/questions/{questionId}")
    @PreAuthorize("hasAuthority('QNA_CHANGE')")
    public ApiResponse<?> updateQuestion(@PathVariable Long questionId, @RequestBody ExternalQnaRequest request,
            @AuthenticationPrincipal AuthUser user) {
        qnaService.updateQuestion(questionId, request, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 5. Q&A 질문 삭제 - 학생, 어드민 가능
    // =================================================================
    @DeleteMapping({ "/api/v1/student/community/qna/questions/{questionId}",
            "/api/v1/admin/community/qna/questions/{questionId}" })
    @PreAuthorize("hasAuthority('QNA_DELETE')")
    public ApiResponse<?> deleteQuestion(@PathVariable Long questionId, @AuthenticationPrincipal AuthUser user) {
        qnaService.deleteQuestion(questionId, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // --- 답변 API ---
    // =================================================================
    // 1. Q&A 답변 등록 - 어드민만 가능
    // =================================================================
    @PostMapping("/api/v1/admin/community/qna/questions/{questionId}/answer")
    @PreAuthorize("hasAuthority('QNA_MANAGE')")
    public ApiResponse<?> createAnswer(@PathVariable Long questionId, @RequestBody ExternalAnswerRequest request,
            @AuthenticationPrincipal AuthUser user) {
        qnaService.createAnswer(questionId, request, user.getAccountId());
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 2. Q&A 답변 수정 - 어드민만 가능
    // =================================================================
    @PatchMapping("/api/v1/admin/community/qna/questions/{questionId}/answer")
    @PreAuthorize("hasAuthority('QNA_MANAGE')")
    public ApiResponse<?> updateAnswer(@PathVariable Long questionId, @RequestBody ExternalAnswerRequest request) {
        qnaService.updateAnswer(questionId, request);
        return ApiResponse.ok(Map.of("success", true));
    }

    // =================================================================
    // 3. Q&A 답변 삭제 - 어드민만 가능
    // =================================================================
    @DeleteMapping("/api/v1/admin/community/qna/questions/{questionId}/answer")
    @PreAuthorize("hasAuthority('QNA_MANAGE')")
    public ApiResponse<?> deleteAnswer(@PathVariable Long questionId) {
        qnaService.deleteAnswer(questionId);
        return ApiResponse.ok(Map.of("success", true));
    }
}