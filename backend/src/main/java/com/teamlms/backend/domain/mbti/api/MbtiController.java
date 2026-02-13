package com.teamlms.backend.domain.mbti.api;

import com.teamlms.backend.domain.mbti.api.dto.MbtiQuestionResponse;
import com.teamlms.backend.domain.mbti.api.dto.InterestKeywordResponse;
import com.teamlms.backend.domain.mbti.api.dto.MbtiJobRecommendationRequest;
import com.teamlms.backend.domain.mbti.api.dto.MbtiJobRecommendationResponse;
import com.teamlms.backend.domain.mbti.api.dto.MbtiResultResponse;
import com.teamlms.backend.domain.mbti.api.dto.MbtiSubmitRequest;
import com.teamlms.backend.domain.mbti.dto.MbtiSubmitCommand;
import com.teamlms.backend.domain.mbti.service.MbtiCommandService;
import com.teamlms.backend.domain.mbti.service.MbtiQueryService;
import com.teamlms.backend.domain.mbti.service.MbtiRecommendationService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.principal.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/mbti")
@RequiredArgsConstructor
public class MbtiController {

    private final MbtiQueryService queryService;
    private final MbtiCommandService commandService;
    private final MbtiRecommendationService recommendationService;

    @GetMapping("/questions")
    public ApiResponse<List<MbtiQuestionResponse>> getQuestions() {
        return ApiResponse.ok(queryService.getAllQuestions());
    }

    @PostMapping("/submit")
    public ApiResponse<MbtiResultResponse> submitMbti(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestBody MbtiSubmitRequest request) {
        MbtiSubmitCommand command = request.toCommand(authUser.getAccountId());
        return ApiResponse.ok(commandService.submitMbti(command));
    }

    @GetMapping("/result")
    public ApiResponse<MbtiResultResponse> getLatestResult(@AuthenticationPrincipal AuthUser authUser) {
        return ApiResponse.ok(queryService.getLatestResult(authUser.getAccountId()));
    }

    @GetMapping("/interest-keywords")
    public ApiResponse<List<InterestKeywordResponse>> getInterestKeywords() {
        return ApiResponse.ok(
                recommendationService.getActiveInterestKeywords().stream()
                        .map(InterestKeywordResponse::from)
                        .toList()
        );
    }

    @PostMapping("/recommendations")
    public ApiResponse<MbtiJobRecommendationResponse> createRecommendation(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestBody MbtiJobRecommendationRequest request
    ) {
        return ApiResponse.ok(recommendationService.generateRecommendation(authUser.getAccountId(), request.keywordIds()));
    }

    @GetMapping("/recommendations/latest")
    public ApiResponse<MbtiJobRecommendationResponse> getLatestRecommendation(
            @AuthenticationPrincipal AuthUser authUser
    ) {
        return ApiResponse.ok(recommendationService.getLatestRecommendation(authUser.getAccountId()));
    }
}
