package com.teamlms.backend.domain.competency.api;

import com.teamlms.backend.domain.competency.api.dto.DiagnosisDetailResponse;
import com.teamlms.backend.domain.competency.api.dto.DiagnosisSubmitRequest;
import com.teamlms.backend.domain.competency.api.dto.MyDiagnosisListItem;
import com.teamlms.backend.domain.competency.service.DiagnosisCommandService;
import com.teamlms.backend.domain.competency.service.DiagnosisQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.principal.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student/diagnoses")
public class StudentDiagnosisController {

    private final DiagnosisQueryService diagnosisQueryService;
    private final DiagnosisCommandService diagnosisCommandService;

    /**
     * 1. 내 진단 목록 조회
     */
    @GetMapping
    @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
    public ApiResponse<List<MyDiagnosisListItem>> listMyDiagnoses(@AuthenticationPrincipal AuthUser user) {
        return ApiResponse.ok(diagnosisQueryService.listMyDiagnoses(user.getAccountId()));
    }

    /**
     * 2. 진단 문항 조회
     */
    @GetMapping("/{diagnosisId}")
    @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
    public ApiResponse<DiagnosisDetailResponse> getQuestions(
            @PathVariable Long diagnosisId,
            @AuthenticationPrincipal AuthUser user) {
        return ApiResponse.ok(diagnosisQueryService.getDiagnosisQuestionsForStudent(diagnosisId, user.getAccountId()));
    }

    /**
     * 3. 진단 제출
     */
    @PostMapping("/{diagnosisId}/submit")
    @PreAuthorize("hasAuthority('DIAGNOSIS_READ')") // 제출도 학생 기본 권한인 READ로 허용하거나 별도 권한 정의 가능
    public ApiResponse<Void> submit(
            @PathVariable Long diagnosisId,
            @RequestBody DiagnosisSubmitRequest req,
            @AuthenticationPrincipal AuthUser user) {
        diagnosisCommandService.submitDiagnosis(diagnosisId, user.getAccountId(), req);
        return ApiResponse.ok(null);
    }
}
