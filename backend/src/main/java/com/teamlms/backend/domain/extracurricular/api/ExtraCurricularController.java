package com.teamlms.backend.domain.extracurricular.api;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularDropdownItem;
import com.teamlms.backend.domain.extracurricular.service.ExtraCurricularQueryService;
import com.teamlms.backend.global.api.ApiResponse;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/extra-curriculars")
public class ExtraCurricularController {
    
    private final ExtraCurricularQueryService extraCurricularQueryService;

    // 비교과 목록 드롭다운
    @GetMapping("/dropdown")
    public ApiResponse<List<ExtraCurricularDropdownItem>> dropdown() {
        return ApiResponse.ok(extraCurricularQueryService.getExtraCurricularDropdown());
    }
}