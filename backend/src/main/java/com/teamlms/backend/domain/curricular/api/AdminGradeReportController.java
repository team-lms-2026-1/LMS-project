package com.teamlms.backend.domain.curricular.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.curricular.api.dto.CurricularGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.CurricularListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentCourseGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentGradeDetailHeaderResponse;
import com.teamlms.backend.domain.curricular.service.StudentGradeReportQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/grade-reports")
public class AdminGradeReportController {

    private final StudentGradeReportQueryService studentGradeReportQueryService;

    // 0) 교과성적 목록
    @GetMapping
    public ApiResponse<List<CurricularGradeListItem>> getCurricularGradeList(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) Long deptId,
        @RequestParam(required = false) String keyword
    ){
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.ASC, "curricularCode")
        );

        Page<CurricularGradeListItem> result =
                studentGradeReportQueryService.curricularGradeList(deptId, keyword, pageable);
        
        return ApiResponse.of(
                result.getContent(),
                PageMeta.from(result)
        );
    }
    
    // 1) 상세 상단 + 추이
    @GetMapping("/{studentAccountId}")
    public ApiResponse<StudentGradeDetailHeaderResponse> detail(
            @PathVariable Long studentAccountId
    ) {
        return ApiResponse.ok(studentGradeReportQueryService.getDetailHeader(studentAccountId));
    }

    // 2) 과목 성적 리스트 (학기 필터 + 페이지)
    @GetMapping("/{studentAccountId}/curricular")
    public ApiResponse<List<StudentCourseGradeListItem>> curricular(
            @PathVariable Long studentAccountId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "semesterId")
        );

        Page<StudentCourseGradeListItem> result =
                studentGradeReportQueryService.listCurricular(studentAccountId, semesterId, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}
