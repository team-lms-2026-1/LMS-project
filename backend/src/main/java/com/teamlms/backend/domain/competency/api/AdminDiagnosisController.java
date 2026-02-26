package com.teamlms.backend.domain.competency.api;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
// import java.util.ArrayList;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

// import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionDomain;
// import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionType;
import com.teamlms.backend.domain.competency.api.dto.*;
import com.teamlms.backend.domain.competency.service.DiagnosisCommandService;
// import com.teamlms.backend.domain.competency.service.DiagnosisCommandService.QuestionCreateData;
// import com.teamlms.backend.domain.competency.service.DiagnosisCommandService.QuestionUpdateData;
import com.teamlms.backend.domain.competency.service.DiagnosisQueryService;
// import com.teamlms.backend.domain.competency.enums.DiagnosisRunStatus;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisRun;
import com.teamlms.backend.domain.competency.entitiy.DiagnosisTarget;
import com.teamlms.backend.domain.competency.enums.DiagnosisTargetStatus;
import com.teamlms.backend.domain.competency.repository.DiagnosisRunRepository;
import com.teamlms.backend.domain.competency.repository.DiagnosisTargetRepository;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping // ("/api/v1/admin/diagnoses")
public class AdminDiagnosisController {

        private final DiagnosisCommandService diagnosisCommandService;
        private final DiagnosisQueryService diagnosisQueryService;
        private final DiagnosisRunRepository diagnosisRunRepository;
        private final DiagnosisTargetRepository diagnosisTargetRepository;
        private final DeptRepository deptRepository;
        private final SemesterRepository semesterRepository;
        private final AlarmCommandService alarmCommandService;

        /**
         * 1-1. 진단지 목록 조회
         */
        @GetMapping({ "/api/v1/admin/diagnoses",
                        "/api/v1/professor/diagnoses"
        })
        @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
        public ApiResponse<List<DiagnosisListItem>> listDiagnoses(
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "20") int size) {

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
                Long runId = diagnosisCommandService.createDiagnosis(req);

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

                diagnosisCommandService.updateDiagnosis(diagnosisId, req);

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
        public ApiResponse<DiagnosisReportResponse> getReport(
                        @PathVariable Long diagnosisId) {
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
                        @RequestParam(defaultValue = "20") int size) {

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
                DiagnosisRun run = diagnosisRunRepository.findById(diagnosisId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.DIAGNOSIS_NOT_FOUND, diagnosisId));

                List<DiagnosisTarget> targets;
                if (Boolean.TRUE.equals(req.getSendToAllPending())) {
                        targets = diagnosisTargetRepository.findPendingTargetsByRunId(diagnosisId);
                } else {
                        List<Long> targetIds = req.getTargetIds();
                        if (targetIds == null || targetIds.isEmpty()) {
                                return ApiResponse.ok(DiagnosisReminderResponse.builder()
                                                .sentCount(0)
                                                .failedCount(0)
                                                .build());
                        }
                        targets = diagnosisTargetRepository.findAllById(targetIds).stream()
                                        .filter(target -> target.getStatus() == DiagnosisTargetStatus.PENDING)
                                        .filter(target -> Objects.equals(target.getRun().getRunId(), diagnosisId))
                                        .collect(Collectors.toList());
                }

                if (targets.isEmpty()) {
                        return ApiResponse.ok(DiagnosisReminderResponse.builder()
                                        .sentCount(0)
                                        .failedCount(0)
                                        .build());
                }

                String semesterName = semesterRepository.findById(run.getSemester().getSemesterId())
                                .map(semester -> semester.getDisplayName())
                                .orElse(null);
                String runTitle = run.getTitle() != null ? run.getTitle().trim() : "";
                Integer targetGrade = run.getTargetGrade();
                if (targetGrade != null && targetGrade <= 0) {
                        targetGrade = null;
                }

                String deptName = null;
                if (run.getDeptId() != null) {
                        deptName = deptRepository.findById(run.getDeptId())
                                        .map(Dept::getDeptName)
                                        .orElse(null);
                }

                String titleKey = "diagnosis.alarm.reminder.title";
                String messageKey;
                Object[] messageArgs;

                if (deptName != null && targetGrade != null) {
                        messageKey = "diagnosis.alarm.reminder.message.dept.grade";
                        messageArgs = new Object[] { semesterName, deptName, targetGrade, runTitle };
                } else if (deptName != null) {
                        messageKey = "diagnosis.alarm.reminder.message.dept";
                        messageArgs = new Object[] { semesterName, deptName, runTitle };
                } else if (targetGrade != null) {
                        messageKey = "diagnosis.alarm.reminder.message.grade";
                        messageArgs = new Object[] { semesterName, targetGrade, runTitle };
                } else {
                        messageKey = "diagnosis.alarm.reminder.message";
                        messageArgs = new Object[] { semesterName, runTitle };
                }

                String linkUrl = "/competencies/dignosis/" + diagnosisId;

                int sentCount = 0;
                for (DiagnosisTarget target : targets) {
                        if (target.getStudent() == null || target.getStudent().getAccountId() == null) {
                                continue;
                        }

                        alarmCommandService.createAlarmI18n(
                                        target.getStudent().getAccountId(),
                                        AlarmType.DIAGNOSIS_REMINDER,
                                        titleKey,
                                        messageKey,
                                        messageArgs,
                                        linkUrl,
                                        null,
                                        null);
                        sentCount++;
                }

                return ApiResponse.ok(DiagnosisReminderResponse.builder()
                                .sentCount(sentCount)
                                .failedCount(0)
                                .build());
        }
}
