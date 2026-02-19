package com.teamlms.backend.domain.competency.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.teamlms.backend.domain.competency.api.dto.*;
import com.teamlms.backend.domain.competency.service.CompetencyQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class AdminCompetencyController {

    private final CompetencyQueryService competencyQueryService;
    private final com.teamlms.backend.domain.competency.service.CompetencySummaryService competencySummaryService;

    /**
     * 0-1. 학생 목록 조회
     */
    @GetMapping({ "/api/v1/admin/competencies/students",
            "/api/v1/professor/competencies/students" })
    @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
    public ApiResponse<List<CompetencyStudentListItem>> listStudents(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "studentNo"));
        Page<CompetencyStudentListItem> result = competencyQueryService.searchCompetencyStudents(keyword, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    /**
     * 0-2. 학생 상세 역량 활동 조회 (대시보드)
     */
    @GetMapping({ "/api/v1/admin/competencies/students/{studentId}/dashboard",
            "/api/v1/student/competencies/students/{studentId}/dashboard",
            "/api/v1/professor/competencies/students/{studentId}/dashboard" })
    @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
    public ApiResponse<StudentCompetencyDashboardResponse> getStudentDashboard(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(defaultValue = "STUDENT") String trendMode) {
        return ApiResponse.ok(competencyQueryService.getStudentDashboard(studentId, semesterId, trendMode));
    }

    /**
     * 0-3. 학기별 전공 역량 점수 전체 재계산
     */
    @PostMapping("/api/v1/admin/competencies/recalculate") // ?semesterId={id}
    @PreAuthorize("hasAuthority('DIAGNOSIS_MANAGE')")
    public ApiResponse<Void> recalculate(@RequestParam Long semesterId) {
        competencySummaryService.recalculateAllSummaries(semesterId);
        return ApiResponse.ok(null);
    }

    /**
     * 0-4. 역량 종합 관리용 역량 통계 조회
     */
    @GetMapping("/api/v1/admin/competencies/statistics")
    @PreAuthorize("hasAuthority('DIAGNOSIS_READ')")
    public ApiResponse<CompetencyResultDashboardResponse> getCompetencyStatistics(
            @RequestParam(required = false) Long diagnosisId,
            @RequestParam(required = false, name = "dignosisId") Long dignosisId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) String semesterName,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) String deptName) {
        Long resolvedDiagnosisId = diagnosisId != null ? diagnosisId : dignosisId;
        return ApiResponse.ok(competencyQueryService.getCompetencyResultDashboard(
                resolvedDiagnosisId,
                semesterId,
                semesterName,
                deptId,
                deptName));
    }
}
