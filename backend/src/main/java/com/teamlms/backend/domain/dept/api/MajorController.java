package com.teamlms.backend.domain.dept.api;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.dept.api.dto.MajorDropdownItem;
import com.teamlms.backend.domain.dept.service.MajorQueryService;
import com.teamlms.backend.global.api.ApiResponse;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/majors")
public class MajorController {
    
    private final MajorQueryService majorQueryService;

    @GetMapping("/dropdown")
    public ApiResponse<List<MajorDropdownItem>> dropdown() {
        return ApiResponse.ok(majorQueryService.getMajorDropdown());
    }
}
