package com.teamlms.backend.domain.study_rental.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.study_rental.api.dto.RoomRequest;
import com.teamlms.backend.domain.study_rental.api.dto.SpaceRequest;
import com.teamlms.backend.domain.study_rental.entity.StudyRoom;
import com.teamlms.backend.domain.study_rental.entity.StudySpace;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRepository;
import com.teamlms.backend.domain.study_rental.repository.StudySpaceImageRepository;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRentalRepository;
import com.teamlms.backend.domain.study_rental.repository.StudySpaceRepository;
import com.teamlms.backend.domain.study_rental.repository.StudySpaceRuleRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.s3.S3Service;

@ExtendWith(MockitoExtension.class)
class StudySpaceCommandServiceTest {

    @InjectMocks
    private StudySpaceCommandService studySpaceCommandService;

    @Mock
    private StudySpaceRepository spaceRepository;

    @Mock
    private StudyRoomRepository roomRepository;

    @Mock
    private StudySpaceRuleRepository ruleRepository;

    @Mock
    private StudyRoomRentalRepository rentalRepository;

    @Mock
    private StudySpaceImageRepository imageRepository;

    @Mock
    private S3Service s3Service;

    @Test
    @DisplayName("학습공간 생성 성공")
    void createSpace_Success() throws Exception {
        // given
        SpaceRequest request = new SpaceRequest();
        ReflectionTestUtils.setField(request, "spaceName", "테스트 공간");
        ReflectionTestUtils.setField(request, "location", "장소 1");
        ReflectionTestUtils.setField(request, "rules", Collections.emptyList());

        StudySpace savedSpace = StudySpace.builder()
                .spaceName("테스트 공간")
                .location("장소 1")
                .isActive(true)
                .build();
        ReflectionTestUtils.setField(savedSpace, "id", 1L);

        when(spaceRepository.save(any(StudySpace.class))).thenReturn(savedSpace);

        // when
        Long spaceId = studySpaceCommandService.createSpace(request, null);

        // then
        assertNotNull(spaceId);
        assertEquals(1L, spaceId);
        verify(spaceRepository).save(any(StudySpace.class));

    }

    @Test
    @DisplayName("학습공간 수정 성공")
    void updateSpace_Success() throws Exception {
        // given
        Long spaceId = 1L;
        SpaceRequest request = new SpaceRequest();
        ReflectionTestUtils.setField(request, "spaceName", "수정된 공간");
        ReflectionTestUtils.setField(request, "location", "수정된 장소");
        ReflectionTestUtils.setField(request, "rules", Collections.emptyList());

        StudySpace space = StudySpace.builder()
                .spaceName("초기 공간")
                .location("초기 장소")
                .isActive(true)
                .build();
        ReflectionTestUtils.setField(space, "id", spaceId);

        when(spaceRepository.findById(spaceId)).thenReturn(Optional.of(space));

        // when
        studySpaceCommandService.updateSpace(spaceId, request, null);
        Long updatedSpaceId = spaceId;

        // then
        assertEquals(spaceId, updatedSpaceId);
        assertEquals("수정된 공간", space.getSpaceName());
        assertEquals("수정된 장소", space.getLocation());
        verify(spaceRepository).findById(spaceId);
    }

    @Test
    @DisplayName("학습공간 삭제 성공 - 논리 삭제")
    void deleteSpace_Success() {
        // given
        Long spaceId = 1L;
        StudySpace space = StudySpace.builder()
                .spaceName("삭제될 공간")
                .isActive(true)
                .build();
        ReflectionTestUtils.setField(space, "id", spaceId);

        when(spaceRepository.existsById(spaceId)).thenReturn(true);

        // when
        studySpaceCommandService.deleteSpace(spaceId);

        // then
        verify(spaceRepository).deleteById(spaceId);
    }

    @Test
    @DisplayName("학습룸 생성 성공")
    void createRoom_Success() {
        // given
        Long spaceId = 1L;
        RoomRequest request = new RoomRequest();
        ReflectionTestUtils.setField(request, "roomName", "테스트 룸");
        ReflectionTestUtils.setField(request, "minPeople", 2);
        ReflectionTestUtils.setField(request, "maxPeople", 6);
        ReflectionTestUtils.setField(request, "operationStartDate", LocalDate.of(2026, 1, 1));
        ReflectionTestUtils.setField(request, "operationEndDate", LocalDate.of(2026, 12, 31));
        ReflectionTestUtils.setField(request, "availableStartTime", LocalTime.of(9, 0));
        ReflectionTestUtils.setField(request, "availableEndTime", LocalTime.of(18, 0));

        StudySpace space = StudySpace.builder().build();
        ReflectionTestUtils.setField(space, "id", spaceId);

        when(spaceRepository.findById(spaceId)).thenReturn(Optional.of(space));

        StudyRoom savedRoom = StudyRoom.builder().build();
        ReflectionTestUtils.setField(savedRoom, "id", 100L);
        when(roomRepository.save(any(StudyRoom.class))).thenReturn(savedRoom);

        // when
        studySpaceCommandService.createRoom(spaceId, request);
        Long roomId = 100L;

        // then
        assertNotNull(roomId);
        assertEquals(100L, roomId);
        verify(spaceRepository).findById(spaceId);
        verify(roomRepository).save(any(StudyRoom.class));
    }

    @Test
    @DisplayName("학습룸 생성 실패 - 시작일이 종료일보다 늦음")
    void createRoom_Fail_InvalidDate() {
        // given
        Long spaceId = 1L;
        RoomRequest request = new RoomRequest();
        ReflectionTestUtils.setField(request, "roomName", "테스트 룸");
        ReflectionTestUtils.setField(request, "minPeople", 2);
        ReflectionTestUtils.setField(request, "maxPeople", 6);
        ReflectionTestUtils.setField(request, "operationStartDate", LocalDate.of(2026, 12, 31)); // 늦은 시작일
        ReflectionTestUtils.setField(request, "operationEndDate", LocalDate.of(2026, 1, 1));
        ReflectionTestUtils.setField(request, "availableStartTime", LocalTime.of(9, 0));
        ReflectionTestUtils.setField(request, "availableEndTime", LocalTime.of(18, 0));

        StudySpace space = StudySpace.builder().build();
        when(spaceRepository.findById(spaceId)).thenReturn(Optional.of(space));

        // when & then
        assertThrows(BusinessException.class, () -> studySpaceCommandService.createRoom(spaceId, request));
    }

    @Test
    @DisplayName("학습룸 수정 성공")
    void updateRoom_Success() {
        // given
        Long roomId = 1L;
        RoomRequest request = new RoomRequest();
        ReflectionTestUtils.setField(request, "roomName", "수정된 룸");
        ReflectionTestUtils.setField(request, "minPeople", 1);
        ReflectionTestUtils.setField(request, "maxPeople", 4);
        ReflectionTestUtils.setField(request, "operationStartDate", LocalDate.of(2026, 1, 1));
        ReflectionTestUtils.setField(request, "operationEndDate", LocalDate.of(2026, 12, 31));
        ReflectionTestUtils.setField(request, "availableStartTime", LocalTime.of(10, 0));
        ReflectionTestUtils.setField(request, "availableEndTime", LocalTime.of(20, 0));

        StudySpace space = StudySpace.builder().build();
        ReflectionTestUtils.setField(space, "id", 1L);

        StudyRoom room = StudyRoom.builder()
                .roomName("초기 룸")
                .minPeople(2)
                .maxPeople(6)
                .operationStartDate(LocalDate.of(2025, 1, 1))
                .operationEndDate(LocalDate.of(2025, 12, 31))
                .rentableStartTime(LocalTime.of(9, 0))
                .rentableEndTime(LocalTime.of(18, 0))
                .studySpace(space)
                .build();
        ReflectionTestUtils.setField(room, "id", roomId);

        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));

        // when
        studySpaceCommandService.updateRoom(roomId, request);
        Long updatedRoomId = roomId;

        // then
        assertEquals(roomId, updatedRoomId);
        assertEquals("수정된 룸", room.getRoomName());
        assertEquals(1, room.getMinPeople());
        assertEquals(4, room.getMaxPeople());
        assertEquals(LocalTime.of(10, 0), room.getRentableStartTime());
    }

    @Test
    @DisplayName("학습룸 삭제 성공")
    void deleteRoom_Success() {
        // given
        Long roomId = 1L;
        StudyRoom room = StudyRoom.builder()
                .roomName("삭제될 룸")
                .isActive(true)
                .build();
        ReflectionTestUtils.setField(room, "id", roomId);

        when(roomRepository.existsById(roomId)).thenReturn(true);

        // when
        studySpaceCommandService.deleteRoom(roomId);

        // then
        verify(roomRepository).deleteById(roomId);
    }
}
