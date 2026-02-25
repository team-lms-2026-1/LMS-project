package com.teamlms.backend.domain.curricular.api;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.teamlms.backend.domain.curricular.api.dto.StudentCourseGradeListItem;
import com.teamlms.backend.domain.curricular.api.dto.StudentGradeDetailHeaderResponse;
import com.teamlms.backend.domain.curricular.service.StudentGradeReportQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student/curricular/grade-reports")
public class StudentGradeReportController {

        private final StudentGradeReportQueryService studentGradeReportQueryService;

        // 내 성적 헤더 + 추이
        @GetMapping("/me")
        @PreAuthorize("hasAuthority('CURRICULAR_READ')")
        public ApiResponse<StudentGradeDetailHeaderResponse> meHeader(
                        @AuthenticationPrincipal AuthUser user) {
                Long studentAccountId = user.getAccountId(); // 너희 AuthUser getter에 맞게
                return ApiResponse.ok(studentGradeReportQueryService.getDetailHeader(studentAccountId));
        }

        // 내 과목 성적 리스트 (학기 필터 + 페이지 + 키워드)
        @GetMapping("/me/list")
        @PreAuthorize("hasAuthority('CURRICULAR_READ')")
        public ApiResponse<List<StudentCourseGradeListItem>> meList(
                        @AuthenticationPrincipal AuthUser user,
                        @RequestParam(required = false) Long semesterId,
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(required = false) String keyword) {
                Long studentAccountId = user.getAccountId();

                int safePage = Math.max(page, 1);
                int safeSize = Math.min(Math.max(size, 1), 100);

                Pageable pageable = PageRequest.of(
                                safePage - 1,
                                safeSize,
                                Sort.by(Sort.Direction.DESC, "semesterId"));

                Page<StudentCourseGradeListItem> result = studentGradeReportQueryService
                                .listCurricular(studentAccountId, semesterId, pageable, keyword);

                return ApiResponse.of(result.getContent(), PageMeta.from(result));
        }
}
