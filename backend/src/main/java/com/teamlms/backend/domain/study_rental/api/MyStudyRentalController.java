package com.teamlms.backend.domain.study_rental.api;

import com.teamlms.backend.domain.account.entity.Account; 
import com.teamlms.backend.domain.study_rental.api.dto.RentalResponse;
import com.teamlms.backend.domain.study_rental.dto.RentalSearchCondition;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import com.teamlms.backend.domain.study_rental.service.StudyRentalQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping
public class MyStudyRentalController {

    private final StudyRentalQueryService queryService;

    // 내 예약 내역 조회
    // @GetMapping("/api/v1/student/spaces-rentals")
    // @PreAuthorize("hasAuthority('RENTAL_READ')")
    // public ApiResponse<List<RentalResponse>> listMyRentals(
    //         @RequestParam(defaultValue = "1") int page,
    //         @RequestParam(defaultValue = "20") int size,
    //         @RequestParam(required = false) String keyword,
    //         @AuthenticationPrincipal Object principal 
    // ) {
    //     Long accountId;

    //     // ID 추출 로직
    //     if (principal instanceof Account) {
    //         accountId = ((Account) principal).getAccountId();
    //     } else if (principal instanceof Long) {
    //         accountId = (Long) principal;
    //     } else {
    //         throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);
    //     }

    //     Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(Sort.Direction.DESC, "appliedAt"));

    //     RentalSearchCondition condition = RentalSearchCondition.builder()
    //             .applicantId(accountId) 
    //             .keyword(keyword)
    //             .build();

    //     Page<RentalResponse> result = queryService.getRentalList(condition, pageable);

    //     return ApiResponse.of(result.getContent(), PageMeta.from(result));
    // }
    @GetMapping("/api/v1/student/spaces-rentals")
    @PreAuthorize("hasAuthority('RENTAL_READ')")
    public ApiResponse<List<RentalResponse>> listMyRentals(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long spaceId,
            @RequestParam(required = false) RentalStatus status,
            @AuthenticationPrincipal Object principal 
    ) {
        
        // 학생 ID를 꺼낸다.
        Long accountId = extractAccountId(principal); 

        Pageable pageable = PageRequest.of(
                Math.max(page - 1, 0), 
                size, 
                Sort.by(Sort.Direction.DESC, "appliedAt")
        );

        RentalSearchCondition condition = RentalSearchCondition.builder()
                .applicantId(accountId) // 실제 로그인한 ID가 조건으로 들어감
                .keyword(keyword)
                .spaceId(spaceId)
                .status(status)
                .build();

        Page<RentalResponse> result = queryService.getRentalList(condition, pageable);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    /**
     * 로그인한 Principal 객체에서 AccountId를 안전하게 추출
     */
    private Long extractAccountId(Object principal) {
        if (principal == null) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);
        }

        if (principal instanceof com.teamlms.backend.global.security.principal.AuthUser authUser) {
            return authUser.getAccountId(); 
        }
        if (principal instanceof Account account) {
            return account.getAccountId();
        }
        if (principal instanceof UserDetails userDetails) {
            return Long.parseLong(userDetails.getUsername());
        }
        if (principal instanceof Long id) return id;
        if (principal instanceof String s) return Long.parseLong(s);

        throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);
    }
}