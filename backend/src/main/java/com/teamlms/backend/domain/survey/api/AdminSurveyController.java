package com.teamlms.backend.domain.survey.api;

import com.teamlms.backend.domain.survey.api.dto.*;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import com.teamlms.backend.domain.survey.service.SurveyCommandService;
import com.teamlms.backend.domain.survey.service.SurveyQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/surveys")
public class AdminSurveyController {

    private final SurveyCommandService commandService;
    private final SurveyQueryService queryService;

    // 설문 목록 조회
    @GetMapping
    public ApiResponse<List<SurveyListResponse>> list(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(required = false) SurveyType type,
            @RequestParam(required = false) SurveyStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        InternalSurveySearchRequest searchRequest = InternalSurveySearchRequest.builder()
                .type(type).status(status).keyword(keyword).build();

        Page<SurveyListResponse> result = queryService.getSurveyList(user.getAccountId(), searchRequest, pageable);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 설문 생성
    @PostMapping
    public ApiResponse<Long> create(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid SurveyCreateRequest request) {
        
        Long surveyId = commandService.createAndPublishSurvey(user.getAccountId(), request);
        return ApiResponse.ok(surveyId);
    }

    // 설문 수정
    @PutMapping("/{surveyId}")
    public ApiResponse<Void> update(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId,
            @RequestBody @Valid SurveyUpdateRequest request) {
        commandService.updateSurvey(user.getAccountId(), surveyId, request);
        return ApiResponse.ok(null);
    }

    // 설문 삭제
    @DeleteMapping("/{surveyId}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId) {
        commandService.deleteSurvey(user.getAccountId(), surveyId);
        return ApiResponse.ok(null);
    }

    // 설문 통계 조회
    @GetMapping("/{surveyId}/stats")
    public ApiResponse<SurveyStatsResponse> stats(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId) {
        return ApiResponse.ok(queryService.getSurveyStats(user.getAccountId(), surveyId));
    }

    // 설문 참여자 목록 조회
    @GetMapping("/{surveyId}/participants")
    public ApiResponse<List<SurveyParticipantResponse>> participants(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId,
            Pageable pageable) {
        Page<SurveyParticipantResponse> result = queryService.getSurveyParticipants(user.getAccountId(), surveyId, pageable);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}
