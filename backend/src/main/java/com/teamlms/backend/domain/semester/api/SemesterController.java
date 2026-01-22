package com.teamlms.backend.domain.semester.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.semester.api.dto.SemesterDropdownItem;
import com.teamlms.backend.domain.semester.service.SemesterQueryService;
import com.teamlms.backend.global.api.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/semesters")
public class SemesterController {

    private final SemesterQueryService semesterQueryService;
    
    @GetMapping("/dropdown")
    public ApiResponse<List<SemesterDropdownItem>> dropdown() {
        return ApiResponse.ok(semesterQueryService.getSemesterDropdown());
    }
}
