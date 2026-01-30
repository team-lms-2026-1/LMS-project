package com.teamlms.backend.domain.survey.api;

import com.teamlms.backend.domain.survey.api.dto.*; // External Request/Response DTOs
import com.teamlms.backend.domain.survey.dto.InternalSurveySearchRequest; // Internal DTO
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import com.teamlms.backend.domain.survey.service.SurveyCommandService;
import com.teamlms.backend.domain.survey.service.SurveyQueryService;
import com.teamlms.backend.domain.survey.service.SurveyResponseService;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.teamlms.backend.domain.survey.api.dto.SurveyParticipantResponse;
import com.teamlms.backend.domain.survey.api.dto.SurveyStatsResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyCommandService commandService;
    private final SurveyQueryService queryService;
    private final SurveyResponseService responseService;

    // [Admin] 설문 생성
    @PostMapping("/admin/surveys")
    public ResponseEntity<Long> createSurvey(
            @AuthenticationPrincipal AuthUser user, // 관리자 ID 확인용
            @RequestBody @Valid SurveyCreateRequest request) {
        System.out.println("DEBUG: Controller createSurvey reached.");
        if (user != null) {
            System.out.println("DEBUG: User ID: " + user.getAccountId());
        } else {
            System.out.println("DEBUG: User is NULL");
        }
        System.out.println("DEBUG: Request Payload: " + request);

        // user.getAccountId()를 넘겨서 관리자 권한 체크 수행
        Long surveyId = commandService.createAndPublishSurvey(user.getAccountId(), request);
        return ResponseEntity.ok(surveyId);
    }

    // [Admin] 설문 목록 조회
    @GetMapping("/admin/surveys")
    public ResponseEntity<Page<SurveyListResponse>> getSurveyListForAdmin(
            @AuthenticationPrincipal AuthUser user, // 관리자 ID 확인용
            @RequestParam(required = false) SurveyType type,
            @RequestParam(required = false) SurveyStatus status,
            @RequestParam(required = false) String keyword,
            Pageable pageable) {

        InternalSurveySearchRequest searchRequest = InternalSurveySearchRequest.builder()
                .type(type).status(status).keyword(keyword).build();

        // user.getAccountId() 전달
        return ResponseEntity.ok(queryService.getSurveyList(user.getAccountId(), searchRequest, pageable));
    }

    // [User] 참여 가능 설문 조회
    @GetMapping("/surveys/available")
    public ResponseEntity<List<SurveyListResponse>> getAvailableSurveys(
            @AuthenticationPrincipal AuthUser user) {

        return ResponseEntity.ok(queryService.getAvailableSurveys(user.getAccountId()));
    }

    // [User] 설문 상세 조회
    @GetMapping("/surveys/{surveyId}")
    public ResponseEntity<SurveyDetailResponse> getSurveyDetail(
            @AuthenticationPrincipal AuthUser user, // 사용자 ID 확인용
            @PathVariable Long surveyId) {
        // user.getAccountId()를 전달하여 권한 체크(학생은 대상자 여부, 교수는 차단)
        return ResponseEntity.ok(queryService.getSurveyDetail(surveyId, user.getAccountId()));
    }

    // [User] 응답 제출
    @PostMapping("/surveys/submit")
    public ResponseEntity<Void> submitResponse(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody @Valid SurveySubmitRequest request) {
        responseService.submitResponse(user.getAccountId(), request);
        return ResponseEntity.ok().build();
    }

    // [Admin] 설문 수정
    @PutMapping("/admin/surveys/{surveyId}")
    public ResponseEntity<Void> updateSurvey(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId,
            @RequestBody @Valid SurveyUpdateRequest request) {
        commandService.updateSurvey(user.getAccountId(), surveyId, request);
        return ResponseEntity.ok().build();
    }

    // [Admin] 설문 삭제
    @DeleteMapping("/admin/surveys/{surveyId}")
    public ResponseEntity<Void> deleteSurvey(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId) {
        commandService.deleteSurvey(user.getAccountId(), surveyId);
        return ResponseEntity.ok().build();
    }

    // 설문 통계 조회 (응답률)
    @GetMapping("/admin/surveys/{surveyId}/stats")
    public ResponseEntity<SurveyStatsResponse> getSurveyStats(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId) {
        return ResponseEntity.ok(queryService.getSurveyStats(user.getAccountId(), surveyId));
    }

    // 설문 참여자 목록 조회
    @GetMapping("/admin/surveys/{surveyId}/participants")
    public ResponseEntity<Page<SurveyParticipantResponse>> getSurveyParticipants(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable Long surveyId,
            Pageable pageable) {
        return ResponseEntity.ok(queryService.getSurveyParticipants(user.getAccountId(), surveyId, pageable));
    }
}