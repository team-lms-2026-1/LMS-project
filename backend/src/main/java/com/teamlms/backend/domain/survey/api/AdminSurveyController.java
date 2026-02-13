package com.teamlms.backend.domain.survey.api;

import com.teamlms.backend.domain.survey.api.dto.*;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import com.teamlms.backend.domain.survey.service.SurveyCommandService;
import com.teamlms.backend.domain.survey.service.SurveyQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/surveys")
@PreAuthorize("hasAuthority('SURVEY_MANAGE')")
public class AdminSurveyController {

    private final SurveyCommandService commandService;
    private final SurveyQueryService queryService;

    // 설문 유형 목록 조회
    @GetMapping("/types")
    public ApiResponse<List<SurveyTypeResponse>> getTypes() {
        return ApiResponse.ok(queryService.getSurveyTypes());
    }

    // 설문 목록 조회
    @GetMapping
    public ApiResponse<List<SurveyListResponse>> list(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) SurveyType type,
            @RequestParam(required = false) SurveyStatus status,
            @RequestParam(required = false) String keyword) {

        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = org.springframework.data.domain.PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "surveyId")
        );

        InternalSurveySearchRequest searchRequest = new InternalSurveySearchRequest(type, status, keyword);

        Page<SurveyListResponse> result = queryService.getSurveyList(searchRequest, pageable);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 설문 생성
    @PostMapping
    public ApiResponse<SuccessResponse> create(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid SurveyCreateRequest request) {
        
        commandService.createAndPublishSurvey(user.getAccountId(), request);
        return ApiResponse.ok(new SuccessResponse());
    }

    @PatchMapping("/{surveyId}")
    public ApiResponse<SuccessResponse> patch(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId,
            @RequestBody @Valid SurveyPatchRequest request) {
        commandService.patchSurvey(surveyId, request);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 설문 상세 조회
    @GetMapping("/{surveyId}")
    public ApiResponse<SurveyDetailResponse> detail(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId) {
        return ApiResponse.ok(queryService.getSurveyDetail(surveyId, user.getAccountId()));
    }

    // 설문 삭제
    public ApiResponse<SuccessResponse> delete(
            @PathVariable Long surveyId) {
        commandService.deleteSurvey(surveyId);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 설문 통계 조회
    @GetMapping("/{surveyId}/stats")
    public ApiResponse<SurveyStatsResponse> stats(
            @PathVariable Long surveyId) {
        return ApiResponse.ok(queryService.getSurveyStats(surveyId));
    }

    // 설문 참여자 목록 조회
    @GetMapping("/{surveyId}/participants")
    public ApiResponse<List<SurveyParticipantResponse>> participants(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = org.springframework.data.domain.PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "targetId")
        );

        Page<SurveyParticipantResponse> result = queryService.getSurveyParticipants(surveyId, pageable);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}
