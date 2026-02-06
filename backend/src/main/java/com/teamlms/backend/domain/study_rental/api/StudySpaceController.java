package com.teamlms.backend.domain.study_rental.api;

import com.teamlms.backend.domain.study_rental.api.dto.RentalApplyRequest;
import com.teamlms.backend.domain.study_rental.api.dto.RoomDetailResponse;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceDetailResponse;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceListResponse;
import com.teamlms.backend.domain.study_rental.dto.SpaceSearchCondition;
import com.teamlms.backend.domain.study_rental.service.StudyRentalCommandService;
import com.teamlms.backend.domain.study_rental.service.StudySpaceQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.PageMeta;
import com.teamlms.backend.global.api.dto.SuccessResponse;

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
public class StudySpaceController {

    private final StudySpaceQueryService queryService;
    private final StudyRentalCommandService rentalCommandService;

    // 학습공간 목록 조회
    @GetMapping({ "/api/v1/student/spaces",
            "/api/v1/admin/spaces" })
    @PreAuthorize("hasAuthority('SPACE_READ')")
    public ApiResponse<List<SpaceListResponse>> listSpaces(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(Sort.Direction.DESC, "createdAt"));
        SpaceSearchCondition condition = SpaceSearchCondition.builder()
                .keyword(keyword)
                .isActiveOnly(true)
                .build();
        Page<SpaceListResponse> result = queryService.getSpaceList(condition, pageable);
        return ApiResponse.of(result.getContent(), PageMeta.from(result));
    }

    // 학습공간 상세 조회
    @GetMapping({ "/api/v1/student/spaces/{spaceId}",
            "/api/v1/admin/spaces/{spaceId}" })
    @PreAuthorize("hasAuthority('SPACE_READ')")
    public ApiResponse<SpaceDetailResponse> getSpaceDetail(@PathVariable Long spaceId) {
        return ApiResponse.ok(queryService.getSpaceDetail(spaceId));
    }

    // 예약 가능한 룸 목록 조회
    @GetMapping("/api/v1/student/spaces/{spaceId}/rooms")
    @PreAuthorize("hasAuthority('SPACE_READ')")
    public ApiResponse<List<RoomDetailResponse>> listAvailableRooms(@PathVariable Long spaceId) {
        return ApiResponse.ok(queryService.getAvailableRooms(spaceId));
    }

    // 예약 신청
    @PostMapping("/api/v1/student/spaces/{spaceId}/rooms")
    @PreAuthorize("hasAuthority('RENTAL_CREATE')")
    public ApiResponse<SuccessResponse> applyRental(
            @PathVariable Long spaceId,
            @Valid @RequestBody RentalApplyRequest req,
            @AuthenticationPrincipal Object principal // Object로 받음
    ) {
        rentalCommandService.applyRental(principal, req);

        return ApiResponse.ok(new SuccessResponse());
    }
}