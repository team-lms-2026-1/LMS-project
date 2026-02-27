package com.teamlms.backend.domain.study_rental.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.study_rental.api.dto.RoomDetailResponse;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceDetailResponse;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceListResponse;
import com.teamlms.backend.domain.study_rental.dto.SpaceSearchCondition;
import com.teamlms.backend.domain.study_rental.entity.StudyRoom;
import com.teamlms.backend.domain.study_rental.entity.StudySpace;
import com.teamlms.backend.domain.study_rental.entity.StudySpaceImage;
import com.teamlms.backend.domain.study_rental.entity.StudySpaceRule;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRepository;
import com.teamlms.backend.domain.study_rental.repository.StudySpaceImageRepository;
import com.teamlms.backend.domain.study_rental.repository.StudySpaceRepository;
import com.teamlms.backend.domain.study_rental.repository.StudySpaceRuleRepository;

@ExtendWith(MockitoExtension.class)
class StudySpaceQueryServiceTest {

    @InjectMocks
    private StudySpaceQueryService studySpaceQueryService;

    @Mock
    private StudySpaceRepository spaceRepository;

    @Mock
    private StudyRoomRepository roomRepository;

    @Mock
    private StudySpaceImageRepository imageRepository;

    @Mock
    private StudySpaceRuleRepository ruleRepository;

    @Test
    @DisplayName("학습공간 목록 조회 성공")
    void getSpaceList_Success() {
        // given
        SpaceSearchCondition condition = SpaceSearchCondition.builder().build(); // 필요에 따라 설정
        Pageable pageable = PageRequest.of(0, 10);

        StudySpace space = StudySpace.builder()
                .spaceName("테스트 공간")
                .location("장소 1")
                .isActive(true)
                .build();
        ReflectionTestUtils.setField(space, "id", 1L);

        Page<StudySpace> spacePage = new PageImpl<>(List.of(space));
        when(spaceRepository.search(any(), any())).thenReturn(spacePage);

        StudyRoom room1 = StudyRoom.builder()
                .minPeople(2)
                .maxPeople(4)
                .operationStartDate(LocalDate.now().minusDays(1))
                .operationEndDate(LocalDate.now().plusDays(10))
                .build();
        StudyRoom room2 = StudyRoom.builder()
                .minPeople(4)
                .maxPeople(8)
                .operationStartDate(LocalDate.now().minusDays(1))
                .operationEndDate(LocalDate.now().plusDays(10))
                .build();

        when(roomRepository.findByStudySpaceIdAndIsActiveTrue(1L)).thenReturn(Arrays.asList(room1, room2));

        StudySpaceImage image = StudySpaceImage.builder().imageUrl("http://test.image").build();
        when(imageRepository.findByStudySpaceIdOrderBySortOrderAsc(1L)).thenReturn(List.of(image));

        // when
        Page<SpaceListResponse> result = studySpaceQueryService.getSpaceList(condition, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        SpaceListResponse response = result.getContent().get(0);
        assertEquals(1L, response.getSpaceId());
        assertEquals("테스트 공간", response.getSpaceName());
        assertEquals(2, response.getMinPeople());
        assertEquals(8, response.getMaxPeople());
        assertEquals("http://test.image", response.getMainImageUrl());
    }

    @Test
    @DisplayName("학습공간 상세 조회 성공")
    void getSpaceDetail_Success() {
        // given
        Long spaceId = 1L;
        StudySpace space = StudySpace.builder()
                .spaceName("테스트 공간")
                .location("장소 1")
                .description("설명")
                .build();
        ReflectionTestUtils.setField(space, "id", spaceId);

        when(spaceRepository.findById(spaceId)).thenReturn(Optional.of(space));

        StudySpaceImage image = StudySpaceImage.builder().imageUrl("img.jpg").sortOrder(1).build();
        ReflectionTestUtils.setField(image, "id", 10L);
        when(imageRepository.findByStudySpaceIdOrderBySortOrderAsc(spaceId)).thenReturn(List.of(image));

        StudySpaceRule rule = StudySpaceRule.builder().content("규칙 1").sortOrder(1).build();
        ReflectionTestUtils.setField(rule, "id", 20L);
        when(ruleRepository.findByStudySpaceIdOrderBySortOrderAsc(spaceId)).thenReturn(List.of(rule));

        StudyRoom room = StudyRoom.builder()
                .operationStartDate(LocalDate.now().minusDays(1))
                .operationEndDate(LocalDate.now().plusDays(10))
                .build();
        when(roomRepository.findByStudySpaceIdAndIsActiveTrue(spaceId)).thenReturn(List.of(room));

        // when
        SpaceDetailResponse result = studySpaceQueryService.getSpaceDetail(spaceId);

        // then
        assertNotNull(result);
        assertEquals(spaceId, result.getSpaceId());
        assertEquals("테스트 공간", result.getSpaceName());
        assertEquals(1, result.getImages().size());
        assertEquals(1, result.getRules().size());
    }

    @Test
    @DisplayName("관리자용 룸 목록 조회 성공 (전체 조회)")
    void getAdminRooms_Success() {
        // given
        Long spaceId = 1L;
        StudyRoom room1 = StudyRoom.builder().roomName("룸 1").build();
        ReflectionTestUtils.setField(room1, "id", 10L);
        StudyRoom room2 = StudyRoom.builder().roomName("룸 2").isActive(false).build();
        ReflectionTestUtils.setField(room2, "id", 20L);

        when(roomRepository.findByStudySpaceId(spaceId)).thenReturn(Arrays.asList(room1, room2));

        // when
        List<RoomDetailResponse> result = studySpaceQueryService.getAdminRooms(spaceId);

        // then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("룸 1", result.get(0).getRoomName());
        assertEquals("룸 2", result.get(1).getRoomName());
    }

    @Test
    @DisplayName("학생용 룸 목록 조회 성공 (Active Only)")
    void getAvailableRooms_Success() {
        // given
        Long spaceId = 1L;
        StudyRoom room1 = StudyRoom.builder().roomName("룸 1").build();
        ReflectionTestUtils.setField(room1, "id", 10L);

        when(roomRepository.findByStudySpaceIdAndIsActiveTrue(spaceId)).thenReturn(List.of(room1));

        // when
        List<RoomDetailResponse> result = studySpaceQueryService.getAvailableRooms(spaceId);

        // then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("룸 1", result.get(0).getRoomName());
    }
}
