package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.domain.study_rental.api.dto.RoomDetailResponse;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceDetailResponse;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceListResponse;
import com.teamlms.backend.domain.study_rental.dto.SpaceSearchCondition;
import com.teamlms.backend.domain.study_rental.entity.*;
import com.teamlms.backend.domain.study_rental.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudySpaceQueryService {

    private final StudySpaceRepository spaceRepository;
    private final StudyRoomRepository roomRepository;
    private final StudySpaceImageRepository imageRepository;
    private final StudySpaceRuleRepository ruleRepository;

    // 1. 학습공간 목록 조회
    public Page<SpaceListResponse> getSpaceList(SpaceSearchCondition condition, Pageable pageable) {
        Page<StudySpace> spaces = spaceRepository.search(condition, pageable);

        return spaces.map(space -> {
            // 해당 공간의 "활성 룸" 정보를 가져와서 통계 계산
            List<StudyRoom> rooms = roomRepository.findByStudySpaceIdAndIsActiveTrue(space.getId());
            
            // 이미지 조회 (첫번째 이미지를 썸네일로 사용)
            List<StudySpaceImage> images = imageRepository.findByStudySpaceIdOrderBySortOrderAsc(space.getId());
            String mainImageUrl = images.isEmpty() ? null : images.get(0).getImageUrl();

            boolean isRentable = checkRentable(rooms);
            int minPeople = rooms.stream().mapToInt(StudyRoom::getMinPeople).min().orElse(0);
            int maxPeople = rooms.stream().mapToInt(StudyRoom::getMaxPeople).max().orElse(0);

            return SpaceListResponse.builder()
                    .spaceId(space.getId())
                    .spaceName(space.getSpaceName())
                    .location(space.getLocation())
                    .isActive(space.getIsActive())
                    .mainImageUrl(mainImageUrl)
                    .isRentable(isRentable)
                    .minPeople(minPeople)
                    .maxPeople(maxPeople)
                    .build();
        });
    }

    // 2. 학습공간 상세 조회
    public SpaceDetailResponse getSpaceDetail(Long spaceId) {
        StudySpace space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_NOT_FOUND_A));

        List<StudySpaceImage> images = imageRepository.findByStudySpaceIdOrderBySortOrderAsc(spaceId);
        List<StudySpaceRule> rules = ruleRepository.findByStudySpaceIdOrderBySortOrderAsc(spaceId);
        List<StudyRoom> rooms = roomRepository.findByStudySpaceIdAndIsActiveTrue(spaceId);

        return SpaceDetailResponse.builder()
                .spaceId(space.getId())
                .spaceName(space.getSpaceName())
                .location(space.getLocation())
                .description(space.getDescription())
                .isRentable(checkRentable(rooms))
                .images(images.stream().map(img -> SpaceDetailResponse.ImageResponse.builder()
                        .imageId(img.getId())
                        .imageUrl(img.getImageUrl())
                        .sortOrder(img.getSortOrder())
                        .build()).collect(Collectors.toList()))
                .rules(rules.stream().map(rule -> SpaceDetailResponse.RuleResponse.builder()
                        .ruleId(rule.getId())
                        .content(rule.getContent())
                        .sortOrder(rule.getSortOrder())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    // 3. 룸 목록 조회 (관리자용 - 전체)
    public List<RoomDetailResponse> getAdminRooms(Long spaceId) {
        return roomRepository.findByStudySpaceId(spaceId).stream()
                .map(this::toRoomResponse)
                .collect(Collectors.toList());
    }

    // 4. 룸 목록 조회 (학생용 - Active Only)
    public List<RoomDetailResponse> getAvailableRooms(Long spaceId) {
        return roomRepository.findByStudySpaceIdAndIsActiveTrue(spaceId).stream()
                .map(this::toRoomResponse)
                .collect(Collectors.toList());
    }

    // Helper: 오늘 날짜 기준 예약 가능 여부 계산
    private boolean checkRentable(List<StudyRoom> rooms) {
        LocalDate today = LocalDate.now();
        return rooms.stream().anyMatch(room -> 
            !today.isBefore(room.getOperationStartDate()) && 
            !today.isAfter(room.getOperationEndDate())
        );
    }

    private RoomDetailResponse toRoomResponse(StudyRoom room) {
        return RoomDetailResponse.builder()
                .roomId(room.getId())
                .roomName(room.getRoomName())
                .minPeople(room.getMinPeople())
                .maxPeople(room.getMaxPeople())
                .description(room.getDescription())
                .operationStartDate(room.getOperationStartDate())
                .operationEndDate(room.getOperationEndDate())
                .availableStartTime(room.getRentableStartTime())
                .availableEndTime(room.getRentableEndTime())
                .build();
    }
}