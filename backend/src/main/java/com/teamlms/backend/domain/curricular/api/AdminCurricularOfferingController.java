package com.teamlms.backend.domain.curricular.api;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingCreateRequest;
import com.teamlms.backend.domain.curricular.service.CurricularOfferingCommandService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.dto.SuccessResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/curricular-offerings")
public class AdminCurricularOfferingController {

    private final CurricularOfferingCommandService curricularOfferingCommandService;
    
    // 생성
    @PostMapping
    public ApiResponse<SuccessResponse> create(
        @Valid @RequestBody CurricularOfferingCreateRequest req
    ) {
        curricularOfferingCommandService.create(
            req.getOfferingCode(),
            req.getCurricularId(),
            req.getSemesterId(),
            req.getDayOfWeek(),
            req.getPeriod(),
            req.getCapacity(),
            req.getLocation(),
            req.getProfessorAccountId()
        );

        return ApiResponse.ok(new SuccessResponse());
    }

}
