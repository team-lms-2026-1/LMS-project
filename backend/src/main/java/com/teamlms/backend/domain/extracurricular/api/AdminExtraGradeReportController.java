package com.teamlms.backend.domain.extracurricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularGradeListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraCompletionListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraGradeDetailHeaderResponse;
import com.teamlms.backend.domain.extracurricular.service.StudentExtraGradeReportQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/extra-curricular/grade-reports")
public class AdminExtraGradeReportController {

    private final StudentExtraGradeReportQueryService studentExtraGradeReportQueryService;

    // 0) ??? ?? ??
    @GetMapping
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ') or hasRole('ADMIN')")
    public ApiResponse<List<ExtraCurricularGradeListItem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) String keyword) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.ASC, "studentNo"));

        Page<ExtraCurricularGradeListItem> result = studentExtraGradeReportQueryService.listStudentGradeSummary(deptId,
                keyword, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 1) ?? ?? + ??
    @GetMapping("/{studentAccountId}")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ') or hasRole('ADMIN')")
    public ApiResponse<StudentExtraGradeDetailHeaderResponse> detail(
            @PathVariable Long studentAccountId) {
        return ApiResponse.ok(studentExtraGradeReportQueryService.getDetailHeader(studentAccountId));
    }

    // 2) ??? ?? ???
    @GetMapping("/{studentAccountId}/list")
    @PreAuthorize("hasAuthority('EXTRA_CURRICULAR_READ') or hasRole('ADMIN')")
    public ApiResponse<List<StudentExtraCompletionListItem>> listDetail(
            @PathVariable Long studentAccountId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "semesterId"));

        Page<StudentExtraCompletionListItem> result = studentExtraGradeReportQueryService
                .listCompletions(studentAccountId, semesterId, pageable, keyword);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}
