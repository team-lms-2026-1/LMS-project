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
import com.teamlms.backend.domain.mbti.service.MbtiI18nService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.i18n.LocaleUtil;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/mbti")
@RequiredArgsConstructor
public class MbtiController {

    private final MbtiQueryService queryService;
    private final MbtiCommandService commandService;
    private final MbtiRecommendationService recommendationService;
    private final MbtiI18nService i18nService;

    /**
     * MBTI 질문 조회 (다국어 지원)
     * Accept-Language 헤더 또는 ?locale=en 쿼리 파라미터로 언어 지정
     */
    @GetMapping("/questions")
    @PreAuthorize("hasAuthority('MBTI_READ')")
    public ApiResponse<List<MbtiQuestionResponse>> getQuestions(
            @RequestParam(value = "locale", required = false) String locale) {
        String currentLocale = locale != null ? locale : LocaleUtil.getCurrentLocale();
        List<MbtiQuestionResponse> questions = i18nService.getAllQuestionsWithI18nAsDto(currentLocale);
        return ApiResponse.ok(questions);
    }

    @PostMapping("/submit")
    @PreAuthorize("hasAuthority('MBTI_MANAGE')")
    public ApiResponse<MbtiResultResponse> submitMbti(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestBody MbtiSubmitRequest request) {
        MbtiSubmitCommand command = request.toCommand(authUser.getAccountId());
        return ApiResponse.ok(commandService.submitMbti(command));
    }

    @GetMapping("/result")
    @PreAuthorize("hasAuthority('MBTI_READ')")
    public ApiResponse<MbtiResultResponse> getLatestResult(@AuthenticationPrincipal AuthUser authUser) {
        return ApiResponse.ok(queryService.getLatestResult(authUser.getAccountId()));
    }

    /**
     * 관심 키워드 조회 (다국어 지원)
     * Accept-Language 헤더 또는 ?locale=en 쿼리 파라미터로 언어 지정
     */
    @GetMapping("/interest-keywords")
    @PreAuthorize("hasAuthority('MBTI_READ')")
    public ApiResponse<List<InterestKeywordResponse>> getInterestKeywords(
            @RequestParam(value = "locale", required = false) String locale) {
        String currentLocale = locale != null ? locale : LocaleUtil.getCurrentLocale();
        List<InterestKeywordResponse> keywords = i18nService.getAllInterestKeywordsWithI18n(currentLocale).stream()
                .map(keyword -> InterestKeywordResponse.fromWithI18n(keyword, currentLocale, i18nService))
                .toList();
        return ApiResponse.ok(keywords);
    }

    @PostMapping("/recommendations")
    @PreAuthorize("hasAuthority('MBTI_MANAGE')")
    public ApiResponse<MbtiJobRecommendationResponse> createRecommendation(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestBody MbtiJobRecommendationRequest request) {
        return ApiResponse
                .ok(recommendationService.generateRecommendation(authUser.getAccountId(), request.keywordIds()));
    }

    @GetMapping("/recommendations/latest")
    @PreAuthorize("hasAuthority('MBTI_READ')")
    public ApiResponse<MbtiJobRecommendationResponse> getLatestRecommendation(
            @AuthenticationPrincipal AuthUser authUser) {
        return ApiResponse.ok(recommendationService.getLatestRecommendation(authUser.getAccountId()));
    }
}
