package com.teamlms.backend.domain.survey.api;

import com.teamlms.backend.domain.survey.api.dto.SurveyDetailResponse;
import com.teamlms.backend.domain.survey.api.dto.SurveyListResponse;
import com.teamlms.backend.domain.survey.api.dto.SurveySubmitRequest;
import com.teamlms.backend.domain.survey.api.dto.SurveyTypeResponse;
import com.teamlms.backend.domain.survey.service.SurveyQueryService;
import com.teamlms.backend.domain.survey.service.SurveyResponseService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/surveys")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('SURVEY_READ')")
public class UserSurveyController {

    private final SurveyQueryService queryService;
    private final SurveyResponseService responseService;

    // 설문 유형 목록 조회
    @GetMapping("/types")
    public ApiResponse<List<SurveyTypeResponse>> getTypes() {
        return ApiResponse.ok(queryService.getSurveyTypes());
    }

    // 참여 가능 설문 조회
    @GetMapping("/available")
    public ApiResponse<List<SurveyListResponse>> listAvailable(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) com.teamlms.backend.domain.survey.enums.SurveyType type) {
        
        // Note: original endpoint was /api/v1/surveys/available
        return ApiResponse.ok(queryService.getAvailableSurveys(user.getAccountId(), keyword, type));
    }

    // 설문 상세 조회
    @GetMapping("/{surveyId}")
    public ApiResponse<SurveyDetailResponse> detail(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId) {
        return ApiResponse.ok(queryService.getSurveyDetail(surveyId, user.getAccountId()));
    }

    // 응답 제출
    @PostMapping("/submit")
    public ApiResponse<SuccessResponse> submit(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid SurveySubmitRequest request) {
        responseService.submitResponse(user.getAccountId(), request);
        return ApiResponse.ok(new SuccessResponse());
    }
}
