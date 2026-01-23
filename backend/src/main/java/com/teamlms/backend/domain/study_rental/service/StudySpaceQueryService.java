package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.domain.study_rental.api.dto.*;
import com.teamlms.backend.domain.study_rental.dto.RoomSearchCondition;
import com.teamlms.backend.domain.study_rental.entity.*;
import com.teamlms.backend.domain.study_rental.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 조회 전용 트랜잭션
public class StudySpaceQueryService {

    private final StudySpaceRepository spaceRepository;
    private final StudyRoomRepository roomRepository;
    private final StudySpaceRuleRepository ruleRepository;
    private final StudyRoomImageRepository imageRepository;

    // 1. 공간 상세 조회 (BFF: 공간 + 룸 목록 + 규칙)
    public SpaceDetailResponse getSpaceDetail(Long spaceId) {
        StudySpace space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 하위 데이터 조회 (별도 쿼리 실행)
        List<StudyRoom> rooms = roomRepository.findBySpaceIdAndIsActiveTrue(spaceId);
        List<StudySpaceRule> rules = ruleRepository.findBySpaceIdOrderBySortOrderAsc(spaceId);

        // Response 조립
        return SpaceDetailResponse.builder()
                .spaceId(space.getId())
                .spaceName(space.getSpaceName())
                .location(space.getLocation())
                .description(space.getDescription())
                .isActive(space.getIsActive())
                .rooms(rooms.stream().map(this::mapToRoomSimple).collect(Collectors.toList()))
                .rules(rules.stream().map(this::mapToRuleResponse).collect(Collectors.toList()))
                .build();
    }

    // 2. 룸 상세 조회 (룸 + 이미지)
    public RoomDetailResponse getRoomDetail(Long roomId) {
        StudyRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 공간 이름 조회를 위한 추가 쿼리 (Join 대체)
        StudySpace space = spaceRepository.findById(room.getSpaceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        List<StudyRoomImage> images = imageRepository.findByRoomIdOrderBySortOrderAsc(roomId);

        return RoomDetailResponse.builder()
                .roomId(room.getId())
                .spaceId(space.getId())
                .spaceName(space.getSpaceName()) // 화면 표시용 이름
                .roomName(room.getRoomName())
                .minPeople(room.getMinPeople())
                .maxPeople(room.getMaxPeople())
                .description(room.getDescription())
                .operationStartDate(room.getOperationStartDate())
                .operationEndDate(room.getOperationEndDate())
                .rentableStartTime(room.getRentableStartTime())
                .rentableEndTime(room.getRentableEndTime())
                .isActive(room.getIsActive())
                .images(images.stream().map(this::mapToImageResponse).collect(Collectors.toList()))
                .build();
    }

    // 3. 조건에 맞는 룸 검색
    public List<RoomSimpleResponse> searchAvailableRooms(RoomSearchCondition condition) {
        // Repository의 @Query 메서드 활용
        List<StudyRoom> rooms = roomRepository.findAvailableRoomsByPeople(condition.getSpaceId(), condition.getPeopleCount());
        
        // 추가 로직: 날짜/시간 검증이 필요하다면 여기서 필터링 (Repository에서 해결 못 한 경우)
        
        return rooms.stream()
                .map(this::mapToRoomSimple)
                .collect(Collectors.toList());
    }

    // --- Private Mappers (Entity -> DTO 변환) ---
    private RoomSimpleResponse mapToRoomSimple(StudyRoom room) {
        // 대표 이미지 1장 조회 (성능상 Batch Size 적용 권장)
        StudyRoomImage thumbnail = imageRepository.findFirstByRoomIdOrderBySortOrderAsc(room.getId());
        
        return RoomSimpleResponse.builder()
                .roomId(room.getId())
                .roomName(room.getRoomName())
                .minPeople(room.getMinPeople())
                .maxPeople(room.getMaxPeople())
                .isActive(room.getIsActive())
                .mainImageUrl(thumbnail != null ? thumbnail.getImageUrl() : null)
                .build();
    }

    private RuleResponse mapToRuleResponse(StudySpaceRule rule) {
        return RuleResponse.builder()
                .ruleId(rule.getId())
                .content(rule.getContent())
                .sortOrder(rule.getSortOrder())
                .build();
    }

    private ImageResponse mapToImageResponse(StudyRoomImage image) {
        return ImageResponse.builder()
                .imageId(image.getId())
                .imageUrl(image.getImageUrl())
                .sortOrder(image.getSortOrder())
                .build();
    }
}