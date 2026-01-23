package com.teamlms.backend.domain.survey.api;

import com.teamlms.backend.domain.survey.api.dto.*; // External Request/Response DTOs
import com.teamlms.backend.domain.survey.dto.InternalSurveySearchRequest; // Internal DTO
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import com.teamlms.backend.domain.survey.service.SurveyCommandService;
import com.teamlms.backend.domain.survey.service.SurveyQueryService;
import com.teamlms.backend.domain.survey.service.SurveyResponseService;
import com.teamlms.backend.global.security.CustomUserDetails; // Security User 객체 (예시)

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyCommandService commandService;
    private final SurveyQueryService queryService;
    private final SurveyResponseService responseService;

    // =================================================================
    // [Admin] 관리자 기능
    // =================================================================

    // 1. 설문 생성 및 배포 (대상자 스냅샷 생성 포함)
    @PostMapping("/admin/surveys")
    public ResponseEntity<Long> createSurvey(@RequestBody @Valid SurveyCreateRequest request) {
        Long surveyId = commandService.createAndPublishSurvey(request);
        return ResponseEntity.ok(surveyId);
    }

    // 2. 설문 목록 조회 (검색 필터 적용)
    @GetMapping("/admin/surveys")
    public ResponseEntity<Page<SurveyListResponse>> getSurveyListForAdmin(
            @RequestParam(required = false) SurveyType type,
            @RequestParam(required = false) SurveyStatus status,
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {
        // 검색 조건을 내부 DTO로 변환하여 Service로 전달
        InternalSurveySearchRequest searchRequest = InternalSurveySearchRequest.builder()
                .type(type)
                .status(status)
                .keyword(keyword)
                .build();
        
        return ResponseEntity.ok(queryService.getSurveyList(searchRequest, pageable));
    }

    // =================================================================
    // [User] 사용자 기능
    // =================================================================

    // 3. 내가 참여해야 할 설문 목록 조회
    @GetMapping("/surveys/available")
    public ResponseEntity<List<SurveyListResponse>> getAvailableSurveys(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(queryService.getAvailableSurveys(user.getId()));
    }

    // 4. 설문 상세 조회 (참여 화면용 - 문항 포함)
    @GetMapping("/surveys/{surveyId}")
    public ResponseEntity<SurveyDetailResponse> getSurveyDetail(@PathVariable Long surveyId) {
        return ResponseEntity.ok(queryService.getSurveyDetail(surveyId));
    }

    // 5. 설문 응답 제출
    @PostMapping("/surveys/submit")
    public ResponseEntity<Void> submitResponse(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody @Valid SurveySubmitRequest request
    ) {
        responseService.submitResponse(user.getId(), request);
        return ResponseEntity.ok().build();
    }
}