package com.teamlms.backend.domain.study_rental.api;

import com.teamlms.backend.domain.study_rental.api.dto.RoomRequest;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceRequest;
import com.teamlms.backend.domain.study_rental.api.dto.RoomDetailResponse;
import com.teamlms.backend.domain.study_rental.service.StudySpaceCommandService;
import com.teamlms.backend.domain.study_rental.service.StudySpaceQueryService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.api.dto.SuccessResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class AdminStudySpaceController {

    private final StudySpaceCommandService commandService;
    private final StudySpaceQueryService queryService;

    // =========================================================
    // 1. 학습공간(Space) 관리
    // =========================================================

    // 공간 생성 (이미지 포함)
    @PostMapping(value = "/api/v1/admin/spaces", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SPACE_MANAGE')")
    public ApiResponse<SuccessResponse> createSpace(
            @Valid @RequestPart("data") SpaceRequest req,
            @RequestPart(value = "image", required = true) MultipartFile image) {
        commandService.createSpace(req, image);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 공간 수정 (이미지 교체 가능)
    @PatchMapping(value = "/api/v1/admin/spaces/{spaceId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SPACE_MANAGE')")
    public ApiResponse<SuccessResponse> updateSpace(
            @PathVariable Long spaceId,
            @Valid @RequestPart("data") SpaceRequest req,
            @RequestPart(value = "image", required = true) MultipartFile image) {
        commandService.updateSpace(spaceId, req, image);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 공간 삭제
    @DeleteMapping("/api/v1/admin/spaces/{spaceId}")
    @PreAuthorize("hasAuthority('SPACE_MANAGE')")
    public ApiResponse<SuccessResponse> deleteSpace(@PathVariable Long spaceId) {
        commandService.deleteSpace(spaceId);
        return ApiResponse.ok(new SuccessResponse());
    }

    // =========================================================
    // 2. 룸(Room) 관리
    // =========================================================

    // 룸 목록 조회 (관리자용 - 전체 조회)
    @GetMapping("/api/v1/admin/spaces/{spaceId}/admin-rooms")
    @PreAuthorize("hasAuthority('SPACE_READ')")
    public ApiResponse<List<RoomDetailResponse>> listAdminRooms(@PathVariable Long spaceId) {
        return ApiResponse.ok(queryService.getAdminRooms(spaceId));
    }

    // 룸 등록
    @PostMapping("/api/v1/admin/spaces/{spaceId}/admin-rooms")
    @PreAuthorize("hasAuthority('SPACE_MANAGE')")
    public ApiResponse<SuccessResponse> createRoom(
            @PathVariable Long spaceId,
            @Valid @RequestBody RoomRequest req) {
        commandService.createRoom(spaceId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 룸 수정
    @PatchMapping("/api/v1/admin/spaces/{spaceId}/admin-rooms/{roomId}")
    @PreAuthorize("hasAuthority('SPACE_MANAGE')")
    public ApiResponse<SuccessResponse> updateRoom(
            @PathVariable Long spaceId,
            @PathVariable Long roomId,
            @Valid @RequestBody RoomRequest req) {
        commandService.updateRoom(roomId, req);
        return ApiResponse.ok(new SuccessResponse());
    }

    // 룸 삭제
    @DeleteMapping("/api/v1/admin/spaces/{spaceId}/admin-rooms/{roomId}")
    @PreAuthorize("hasAuthority('SPACE_MANAGE')")
    public ApiResponse<SuccessResponse> deleteRoom(
            @PathVariable Long spaceId,
            @PathVariable Long roomId) {
        commandService.deleteRoom(roomId);
        return ApiResponse.ok(new SuccessResponse());
    }
}