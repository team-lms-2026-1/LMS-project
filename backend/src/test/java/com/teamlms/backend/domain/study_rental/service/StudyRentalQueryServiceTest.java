package com.teamlms.backend.domain.study_rental.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
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

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.repository.DeptRepository;

import com.teamlms.backend.domain.study_rental.api.dto.RentalResponse;
import com.teamlms.backend.domain.study_rental.dto.RentalSearchCondition;
import com.teamlms.backend.domain.study_rental.entity.StudyRoom;
import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.entity.StudySpace;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRentalRepository;
import com.teamlms.backend.global.security.principal.AuthUser;

@ExtendWith(MockitoExtension.class)
class StudyRentalQueryServiceTest {

    @InjectMocks
    private StudyRentalQueryService studyRentalQueryService;

    @Mock
    private StudyRoomRentalRepository rentalRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private ProfessorProfileRepository professorProfileRepository;

    @Mock
    private DeptRepository deptRepository;

    @Test
    @DisplayName("예약 목록 조회 성공 (관리자용)")
    void getRentalList_Success() {
        // given
        RentalSearchCondition condition = RentalSearchCondition.builder().build();
        Pageable pageable = PageRequest.of(0, 10);

        Account applicant = mock(Account.class);
        when(applicant.getAccountId()).thenReturn(1L);

        StudySpace space = StudySpace.builder().spaceName("테스트 공간").build();
        ReflectionTestUtils.setField(space, "id", 1L);
        StudyRoom room = StudyRoom.builder().roomName("테스트 룸").studySpace(space).build();

        StudyRoomRental rental = StudyRoomRental.builder()
                .applicant(applicant)
                .studyRoom(room)
                .startAt(LocalDateTime.now().minusHours(1))
                .endAt(LocalDateTime.now().plusHours(1))
                .build();
        ReflectionTestUtils.setField(rental, "id", 100L);

        Page<StudyRoomRental> rentalPage = new PageImpl<>(List.of(rental));
        when(rentalRepository.search(any(), any(), any(), any(), any())).thenReturn(rentalPage);

        StudentProfile profile = StudentProfile.builder().name("홍길동").deptId(10L).build();
        ReflectionTestUtils.setField(profile, "accountId", 1L);
        when(studentProfileRepository.findAllById(any())).thenReturn(List.of(profile));

        // when
        Page<RentalResponse> result = studyRentalQueryService.getRentalList(condition, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        RentalResponse response = result.getContent().get(0);
        assertEquals(100L, response.getRentalId());
        assertEquals("테스트 공간", response.getSpace().getSpaceName());
        assertEquals("홍길동", response.getApplicant().getName());
    }

    @Test
    @DisplayName("내 예약 상세 조회 성공")
    void getMyRentalDetail_Success() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(1L);

        Long rentalId = 1L;

        Account applicant = mock(Account.class);
        when(applicant.getAccountId()).thenReturn(1L);

        StudySpace space = StudySpace.builder()
                .spaceName("테스트 공간")
                .location("위치 1")
                .build();
        ReflectionTestUtils.setField(space, "id", 100L);
        StudyRoom room = StudyRoom.builder()
                .roomName("테스트 룸")
                .studySpace(space)
                .build();
        ReflectionTestUtils.setField(room, "id", 200L);

        StudyRoomRental rental = StudyRoomRental.builder()
                .applicant(applicant)
                .studyRoom(room)
                .startAt(LocalDateTime.now().minusHours(1))
                .endAt(LocalDateTime.now().plusHours(1))
                .build();
        ReflectionTestUtils.setField(rental, "id", rentalId);

        when(rentalRepository.findById(rentalId)).thenReturn(Optional.of(rental));

        StudentProfile profile = StudentProfile.builder().name("홍길동").deptId(10L).build();
        ReflectionTestUtils.setField(profile, "accountId", 1L);
        when(studentProfileRepository.findAllById(any())).thenReturn(List.of(profile));

        // when
        RentalResponse result = studyRentalQueryService.getMyRentalDetail(rentalId, principal);

        // then
        assertNotNull(result);
        assertEquals(rentalId, result.getRentalId());
        assertEquals("테스트 공간", result.getSpace().getSpaceName());

        assertEquals("홍길동", result.getApplicant().getName());
    }
}
