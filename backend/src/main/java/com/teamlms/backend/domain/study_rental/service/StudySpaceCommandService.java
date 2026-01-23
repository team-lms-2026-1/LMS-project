package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.domain.study_rental.api.dto.*;
import com.teamlms.backend.domain.study_rental.entity.*;
import com.teamlms.backend.domain.study_rental.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional // 기본적으로 트랜잭션 적용
public class StudySpaceCommandService {

    private final StudySpaceRepository spaceRepository;
    private final StudyRoomRepository roomRepository;
    private final StudySpaceRuleRepository ruleRepository;
    private final StudyRoomImageRepository imageRepository;

    // 1. 공간 생성
    public Long createSpace(SpaceRequest request) {
        // 엔티티 생성 (Builder 사용, 비즈니스 로직은 서비스에서 처리)
        StudySpace space = StudySpace.builder()
                .spaceName(request.getSpaceName())
                .location(request.getLocation())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true) // 기본값 처리
                .build();

        return spaceRepository.save(space).getId();
    }

    // 2. 룸 생성
    public Long createRoom(RoomRequest request) {
        // 존재 여부 검증
        if (!spaceRepository.existsById(request.getSpaceId())) {
            throw new BusinessException(ErrorCode.NOT_FOUND); // Space Not Found
        }

        // 비즈니스 검증: 최대 인원은 최소 인원보다 커야 함
        if (request.getMinPeople() > request.getMaxPeople()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        // 비즈니스 검증: 운영 종료일이 시작일보다 뒤여야 함
        if (request.getOperationStartDate().isAfter(request.getOperationEndDate())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        StudyRoom room = StudyRoom.builder()
                .spaceId(request.getSpaceId())
                .roomName(request.getRoomName())
                .minPeople(request.getMinPeople())
                .maxPeople(request.getMaxPeople())
                .description(request.getDescription())
                .operationStartDate(request.getOperationStartDate())
                .operationEndDate(request.getOperationEndDate())
                .rentableStartTime(request.getRentableStartTime())
                .rentableEndTime(request.getRentableEndTime())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return roomRepository.save(room).getId();
    }

    // 3. 규칙 추가
    public Long createRule(RuleRequest request) {
        if (!spaceRepository.existsById(request.getSpaceId())) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        StudySpaceRule rule = StudySpaceRule.builder()
                .spaceId(request.getSpaceId())
                .content(request.getContent())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        return ruleRepository.save(rule).getId();
    }

    // 4. 이미지 추가
    public Long createImage(ImageRequest request) {
        if (!roomRepository.existsById(request.getRoomId())) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        StudyRoomImage image = StudyRoomImage.builder()
                .roomId(request.getRoomId())
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        return imageRepository.save(image).getId();
    }
}