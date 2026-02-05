package com.teamlms.backend.domain.competency.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionDomain;
import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionType;
import com.teamlms.backend.domain.competency.api.dto.*;
import com.teamlms.backend.domain.competency.service.DiagnosisCommandService;
import com.teamlms.backend.domain.competency.service.DiagnosisCommandService.QuestionCreateData;
import com.teamlms.backend.domain.competency.service.DiagnosisCommandService.QuestionUpdateData;
import com.teamlms.backend.domain.competency.service.DiagnosisQueryService;
import com.teamlms.backend.domain.competency.enums.DiagnosisRunStatus;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping // ("/api/v1/admin/diagnoses")
public class AdminDiagnosisController {

        private final DiagnosisCommandService diagnosisCommandService;
        private final DiagnosisQueryService diagnosisQueryService;

        /**
         * 1-1. 진단지 목록 조회
         */
        @GetMapping({ "/api/v1/admin/diagnoses",
                        "/api/v1/professor/diagnoses"
        })
        @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
        public ApiResponse<List<DiagnosisListItem>> listDiagnoses(
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "10") int size) {

                Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
                Page<DiagnosisListItem> result = diagnosisQueryService.listDiagnoses(pageable);

                return ApiResponse.of(result.getContent(), PageMeta.from(result));
        }

        /**
         * 1-2. 진단지 상세 조회
         */
        @GetMapping({ "/api/v1/admin/diagnoses/{diagnosisId}",
                        "/api/v1/professor/diagnoses/{diagnosisId}" })
        @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
        public ApiResponse<DiagnosisDetailResponse> getDiagnosisDetail(@PathVariable Long diagnosisId) {
                return ApiResponse.ok(diagnosisQueryService.getDiagnosisDetail(diagnosisId));
        }

        /**
         * 1-3. 진단지 등록
         */
        @PostMapping("/api/v1/admin/diagnoses")
        @PreAuthorize("hasAuthority('DIAGNOSIS_MANAGE')")
        public ApiResponse<DiagnosisCreateResponse> createDiagnosis(@Valid @RequestBody DiagnosisCreateRequest req) {
                List<QuestionCreateData> questions = req.getQuestions().stream()
                                .map(q -> QuestionCreateData.builder()
                                                .domain(DiagnosisQuestionDomain.SKILL) // Default
                                                .questionType(DiagnosisQuestionType.valueOf(q.getType()))
                                                .text(q.getText())
                                                .order(q.getOrder())
                                                .weights(q.getWeights())
                                                .build())
                                .collect(java.util.stream.Collectors.toList());

                Long runId = diagnosisCommandService.createDiagnosis(
                                req.getTitle(),
                                req.getSemesterId(),
                                req.getTargetGrade(),
                                req.getDeptId(),
                                req.getStartedAt(),
                                req.getEndedAt(),
                                questions);

                return ApiResponse.ok(DiagnosisCreateResponse.builder()
                                .diagnosisId(runId)
                                .status("DRAFT")
                                .createdAt(java.time.LocalDateTime.now())
                                .build());
        }

        /**
         * 1-4. 진단지 수정
         */
        @PatchMapping("/api/v1/admin/diagnoses/{diagnosisId}")
        @PreAuthorize("hasAuthority('DIAGNOSIS_MANAGE')")
        public ApiResponse<DiagnosisPatchResponse> updateDiagnosis(
                        @PathVariable Long diagnosisId,
                        @RequestBody DiagnosisPatchRequest req) {

                DiagnosisRunStatus status = req.getStatus() != null ? DiagnosisRunStatus.valueOf(req.getStatus())
                                : null;

                List<QuestionUpdateData> questions = null;
                if (req.getQuestions() != null) {
                        questions = req.getQuestions().stream()
                                        .map(q -> QuestionUpdateData.builder()
                                                        .domain(DiagnosisQuestionDomain.SKILL) // Default
                                                        .questionType(q.getType() != null
                                                                        ? DiagnosisQuestionType.valueOf(q.getType())
                                                                        : null)
                                                        .text(q.getText())
                                                        .order(q.getOrder())
                                                        .weights(q.getWeights())
                                                        .build())
                                        .collect(java.util.stream.Collectors.toList());
                }

                diagnosisCommandService.updateDiagnosis(
                                diagnosisId,
                                req.getTitle(),
                                req.getEndedAt(),
                                status,
                                questions);

                return ApiResponse.ok(DiagnosisPatchResponse.builder()
                                .diagnosisId(diagnosisId)
                                .status(req.getStatus())
                                .updatedAt(java.time.LocalDateTime.now())
                                .build());
        }

        /**
         * 1-5. 진단지 삭제
         */
        @DeleteMapping("/api/v1/admin/diagnoses/{diagnosisId}")
        @PreAuthorize("hasAuthority('DIAGNOSIS_MANAGE')")
        public ApiResponse<DiagnosisDeleteResponse> deleteDiagnosis(@PathVariable Long diagnosisId) {
                diagnosisCommandService.deleteDiagnosis(diagnosisId);
                return ApiResponse.ok(DiagnosisDeleteResponse.builder()
                                .deletedId(diagnosisId)
                                .result("DELETED")
                                .build());
        }

        /**
         * 2-1. 결과 관리 (종합리포트) 응답 만들어서 실시해야 값을 가져옴
         */
        @GetMapping({ "/api/v1/admin/diagnoses/{diagnosisId}/report",
                        "/api/v1/student/diagnoses/{diagnosisId}/report",
                        "/api/v1/professor/diagnoses/{diagnosisId}/report" })
        @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
        public ApiResponse<DiagnosisReportResponse> getReport(@PathVariable Long diagnosisId) {
                return ApiResponse.ok(diagnosisQueryService.getDiagnosisReport(diagnosisId));
        }

        /**
         * 2-2. 응합 현황 분포
         */
        @GetMapping({ "/api/v1/admin/diagnoses/{diagnosisId}/responses/distribution",
                        "/api/v1/student/diagnoses/{diagnosisId}/responses/distribution",
                        "/api/v1/professor/diagnoses/{diagnosisId}/responses/distribution" })
        @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
        public ApiResponse<DiagnosisDistributionResponse> getDistribution(@PathVariable Long diagnosisId) {
                return ApiResponse.ok(diagnosisQueryService.getDiagnosisDistribution(diagnosisId));
        }

        /**
         * 2-3. 미실시 학생 목록 조회
         */
        @GetMapping("/api/v1/admin/diagnoses/{diagnosisId}/participants")
        @PreAuthorize("hasAuthority('DIAGNOSIS_MANAGE')")
        public ApiResponse<List<DiagnosisParticipantItem>> getParticipants(
                        @PathVariable Long diagnosisId,
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "10") int size) {

                Pageable pageable = PageRequest.of(page - 1, size);
                Page<DiagnosisParticipantItem> result = diagnosisQueryService.getParticipants(diagnosisId, pageable);

                return ApiResponse.of(result.getContent(), PageMeta.from(result));
        }

        /**
         * 2-4. 독려 메일 발송
         */
        @PostMapping("/api/v1/admin/diagnoses/{diagnosisId}/reminders/send")
        @PreAuthorize("hasAuthority('DIAGNOSIS_MANAGE')")
        public ApiResponse<DiagnosisReminderResponse> sendReminders(
                        @PathVariable Long diagnosisId,
                        @Valid @RequestBody DiagnosisReminderRequest req) {
                // Mocking sender logic
                return ApiResponse.ok(DiagnosisReminderResponse.builder()
                                .sentCount(req.getTargetIds().size())
                                .failedCount(0)
                                .build());
        }
}
