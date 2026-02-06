package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.domain.study_rental.api.dto.RoomRequest;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceRequest;
import com.teamlms.backend.domain.study_rental.entity.*;
import com.teamlms.backend.domain.study_rental.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StudySpaceCommandService {

    private final StudySpaceRepository spaceRepository;
    private final StudyRoomRepository roomRepository;
    private final StudySpaceRuleRepository ruleRepository;
    private final StudySpaceImageRepository imageRepository;
    private final S3Service s3Service;

    // =======================================================
    // 1. 학습공간 (Space)
    // =======================================================

    public Long createSpace(SpaceRequest request, MultipartFile image) {

        // 공간 이름 중복 검사
        if (spaceRepository.existsBySpaceName(request.getSpaceName())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        // 1. 공간 저장
        StudySpace space = StudySpace.builder()
                .spaceName(request.getSpaceName())
                .location(request.getLocation())
                .description(request.getDescription())
                .isActive(true)
                .build();
        StudySpace savedSpace = spaceRepository.save(space);

        // 2. 이미지 업로드 및 저장 (study_space_image 테이블)
        if (image != null && !image.isEmpty()) {
            uploadAndSaveSpaceImage(savedSpace, image);
        }

        // 3. 규칙 저장
        if (request.getRules() != null) {
            request.getRules().forEach(ruleReq -> {
                StudySpaceRule rule = StudySpaceRule.builder()
                        .studySpace(savedSpace)
                        .content(ruleReq.getContent())
                        .sortOrder(ruleReq.getSortOrder())
                        .build();
                ruleRepository.save(rule);
            });
        }

        return savedSpace.getId();
    }

    public void updateSpace(Long spaceId, SpaceRequest request, MultipartFile newImage) {
        StudySpace space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_NOT_UPDATE));

        // 1. 이미지 교체 로직
        if (newImage != null && !newImage.isEmpty()) {
            // 기존 이미지 삭제 (DB + S3)
            List<StudySpaceImage> oldImages = imageRepository.findByStudySpaceIdOrderBySortOrderAsc(spaceId);
            for (StudySpaceImage oldImg : oldImages) {
                s3Service.delete(parseKeyFromUrl(oldImg.getImageUrl()));
                imageRepository.delete(oldImg);
            }
            // 새 이미지 저장
            uploadAndSaveSpaceImage(space, newImage);
        }

        // 2. 정보 업데이트 (Dirty Checking)
        space.update(
                request.getSpaceName(),
                request.getLocation(),
                request.getDescription());
        // 3. 규칙 교체 (기존 삭제 -> 재생성)
        ruleRepository.deleteByStudySpaceId(spaceId);
        if (request.getRules() != null) {
            request.getRules().forEach(ruleReq -> {
                StudySpaceRule rule = StudySpaceRule.builder()
                        .studySpace(space)
                        .content(ruleReq.getContent())
                        .sortOrder(ruleReq.getSortOrder())
                        .build();
                ruleRepository.save(rule);
            });
        }
    }

    public void deleteSpace(Long spaceId) {
        if (!spaceRepository.existsById(spaceId)) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_NOT_DELETE);
        }

        // 1. 부가 정보 삭제 (규칙, 이미지)
        ruleRepository.deleteByStudySpaceId(spaceId);

        List<StudySpaceImage> images = imageRepository.findByStudySpaceIdOrderBySortOrderAsc(spaceId);
        images.forEach(img -> s3Service.delete(parseKeyFromUrl(img.getImageUrl())));

        imageRepository.deleteByStudySpaceId(spaceId);

        // 2. 룸과 예약 내역 삭제 (순서 중요: 예약 -> 룸)
        // 2-1. 이 공간에 속한 모든 룸을 찾음
        List<StudyRoom> rooms = roomRepository.findByStudySpaceId(spaceId);

        // 2-2. 각 룸에 딸린 예약 내역을 먼저 삭제
        for (StudyRoom room : rooms) {
            rentalRepository.deleteByStudyRoomId(room.getId());
        }

        // 2-3. 예약이 지워졌으니 룸 삭제 가능
        roomRepository.deleteByStudySpaceId(spaceId);

        // 3. 최종적으로 공간 삭제
        spaceRepository.deleteById(spaceId);
    }
    // =======================================================
    // 2. 학습 룸 (Room)
    // =======================================================

    public void createRoom(Long spaceId, RoomRequest request) {
        StudySpace space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_NOT_CREATE));

        validateRoomRequest(request);

        // [추가된 부분] 해당 공간 내 룸 이름 중복 검사
        if (roomRepository.existsByStudySpaceIdAndRoomName(spaceId, request.getRoomName())) {
            // ErrorCode는 상황에 맞게 정의해서 사용하세요 (예: ROOM_NAME_DUPLICATE)
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        StudyRoom room = StudyRoom.builder()
                .studySpace(space)
                .roomName(request.getRoomName())
                .minPeople(request.getMinPeople())
                .maxPeople(request.getMaxPeople())
                .description(request.getDescription())
                .operationStartDate(request.getOperationStartDate())
                .operationEndDate(request.getOperationEndDate())
                .rentableStartTime(request.getAvailableStartTime())
                .rentableEndTime(request.getAvailableEndTime())
                .isActive(true)
                .build();

        roomRepository.save(room);
    }

    public void updateRoom(Long roomId, RoomRequest request) {
        // 1. 조회 (room 변수 선언)
        StudyRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_RENTAL_NOT_UPDATE));

        // 2. 유효성 검증
        validateRoomRequest(request);

        // 3. 엔티티 업데이트 메서드 호출 (room 변수 사용됨 -> 노란줄 해결)

        room.update(
                request.getRoomName(),
                request.getMinPeople(),
                request.getMaxPeople(),
                request.getDescription(),
                request.getOperationStartDate(),
                request.getOperationEndDate(),
                request.getAvailableStartTime(),
                request.getAvailableEndTime());

    }

    private final StudyRoomRentalRepository rentalRepository;

    public void deleteRoom(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        rentalRepository.deleteByStudyRoomId(roomId);
        roomRepository.deleteById(roomId);
    }

    // =======================================================
    // Helper Methods
    // =======================================================

    private void uploadAndSaveSpaceImage(StudySpace space, MultipartFile file) {
        try {
            String imageUrl = s3Service.upload(file, "spaces");
            StudySpaceImage spaceImage = StudySpaceImage.builder()
                    .studySpace(space)
                    .imageUrl(imageUrl)
                    .sortOrder(0)
                    .build();
            imageRepository.save(spaceImage);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }

    private void validateRoomRequest(RoomRequest req) {
        if (req.getOperationStartDate().isAfter(req.getOperationEndDate())) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_NOT_EN_TIME);
        }
        if (req.getAvailableStartTime().isAfter(req.getAvailableEndTime())) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_NOT_ST_TIME);
        }
        if (req.getMinPeople() > req.getMaxPeople()) {
            throw new BusinessException(ErrorCode.STUDY_RENTAL_MIN_MAX);
        }
    }

    private String parseKeyFromUrl(String url) {
        // S3 Key 파싱 로직 (예: https://.../spaces/abc.jpg -> spaces/abc.jpg)
        if (url.contains("spaces/"))
            return url.substring(url.indexOf("spaces/"));
        return url;
    }
}