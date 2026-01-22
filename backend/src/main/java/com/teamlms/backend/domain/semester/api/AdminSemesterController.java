package com.teamlms.backend.domain.semester.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.semester.api.dto.SemesterCreateRequest;
import com.teamlms.backend.domain.semester.api.dto.SemesterEditFormResponse;
import com.teamlms.backend.domain.semester.api.dto.SemesterListItem;
import com.teamlms.backend.domain.semester.api.dto.SemesterUpdateRequest;
import com.teamlms.backend.domain.semester.service.SemesterCommandService;
import com.teamlms.backend.domain.semester.service.SemesterQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/semesters")
public class AdminSemesterController {
    
    private final SemesterCommandService semesterCommandService;
    private final SemesterQueryService semesterQueryService;

    // 학기등록
    @PostMapping
    public ApiResponse<SuccessResponse> create(@Valid @RequestBody SemesterCreateRequest req) {
    
        semesterCommandService.create(
                req.year(),
                req.term(),
                req.startDate(),
                req.endDate()
        );

        return ApiResponse.ok(new SuccessResponse());
    }

    // 학기수정(수정창 조회)
    @GetMapping("/{semesterId}/edit")
    public ApiResponse<SemesterEditFormResponse> getSemesterForUpdate(
            @PathVariable Long semesterId
    ) {
        return ApiResponse.ok(semesterQueryService.getSemesterForUpdate(semesterId));
    }

    // 학기수정
    @PatchMapping("/{semesterId}/edit")
    public ApiResponse<SuccessResponse> updateSemester(
            @PathVariable Long semesterId,
            @Valid @RequestBody SemesterUpdateRequest req
    ) {
        semesterCommandService.patchSemester(
                semesterId,
                req.startDate(),
                req.endDate(),
                req.status()
        );

        return ApiResponse.ok(new SuccessResponse());
    }

    // 학기목록조회
    @GetMapping
    public ApiResponse<List<SemesterListItem>> listSemesters(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size
    ){
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<SemesterListItem> result = 
                semesterQueryService.listSemesters(pageable);
        
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }
}
