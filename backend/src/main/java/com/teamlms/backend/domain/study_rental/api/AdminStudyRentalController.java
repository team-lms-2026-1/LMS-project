package com.teamlms.backend.domain.study_rental.api;

import com.teamlms.backend.domain.account.entity.Account; // 
import com.teamlms.backend.domain.study_rental.api.dto.RentalProcessRequest;
import com.teamlms.backend.domain.study_rental.api.dto.RentalResponse;
import com.teamlms.backend.domain.study_rental.dto.RentalSearchCondition;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import com.teamlms.backend.domain.study_rental.service.StudyRentalCommandService;
import com.teamlms.backend.domain.study_rental.service.StudyRentalQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.security.principal.AuthUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping
public class AdminStudyRentalController {

    private final StudyRentalQueryService queryService;
    private final StudyRentalCommandService commandService;

    // 예약 목록 조회
    @GetMapping("/api/v1/admin/spaces-rentals")
    @PreAuthorize("hasAuthority('RENTAL_READ')")
    public ApiResponse<List<RentalResponse>> listRentals(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long spaceId,
            @RequestParam(required = false) RentalStatus status
    ) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        
        RentalSearchCondition condition = RentalSearchCondition.builder()
                .keyword(keyword)
                .spaceId(spaceId)
                .status(status)
                .build();

        Page<RentalResponse> result = queryService.getRentalList(condition, pageable);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 예약 상태 변경 (승인/반려)
    @PatchMapping("/api/v1/admin/spaces-rentals/{rentalId}")
    @PreAuthorize("hasAuthority('RENTAL_MANAGE')")
    public ApiResponse<SuccessResponse> processRental(
            @PathVariable Long rentalId,
            @Valid @RequestBody RentalProcessRequest req,
            @AuthenticationPrincipal Object principal // Object로 받음
    ) {
        Long accountId;

   
        if (principal instanceof AuthUser) {
            accountId = ((AuthUser) principal).getAccountId();
        } 
        else if (principal instanceof Account) {
            accountId = ((Account) principal).getAccountId();
        } 
        else if (principal instanceof Long) {
            accountId = (Long) principal;
        } 
        else {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);
        }


        log.info("Rental Process - Admin Account ID: {}", accountId);

        commandService.processRental(accountId, rentalId, req);
        
        return ApiResponse.ok(new SuccessResponse());
    }
}