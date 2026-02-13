package com.teamlms.backend.domain.study_rental.api;

import com.teamlms.backend.domain.study_rental.api.dto.RentalResponse;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import com.teamlms.backend.domain.study_rental.service.StudyRentalQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class MyStudyRentalController {

    private final StudyRentalQueryService queryService;
    private final com.teamlms.backend.domain.study_rental.service.StudyRentalCommandService commandService;

    @GetMapping("/api/v1/student/spaces-rentals")
    @PreAuthorize("hasAuthority('RENTAL_READ')")
    public ApiResponse<List<RentalResponse>> listMyRentals(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long spaceId,
            @RequestParam(required = false) RentalStatus status,
            @AuthenticationPrincipal Object principal) {

        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<RentalResponse> result = queryService.getMyRentalList(
                keyword, spaceId, status, pageable, principal);

        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    @GetMapping("/api/v1/student/spaces-rentals/{rentalId}")
    @PreAuthorize("hasAuthority('RENTAL_READ')")
    public ApiResponse<RentalResponse> getMyRentalDetail(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal Object principal) {
        return ApiResponse.ok(queryService.getMyRentalDetail(rentalId, principal));
    }

    @PatchMapping("/api/v1/student/spaces-rentals/{rentalId}/cancel")
    @PreAuthorize("hasAuthority('RENTAL_DELETE')")
    public ApiResponse<Void> cancelRental(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal Object principal) {

        commandService.cancelRental(principal, rentalId);

        return ApiResponse.ok(null);
    }
}
