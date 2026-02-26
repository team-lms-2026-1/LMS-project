package com.teamlms.backend.domain.study_rental.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.study_rental.api.dto.RentalApplyRequest;
import com.teamlms.backend.domain.study_rental.api.dto.RentalProcessRequest;
import com.teamlms.backend.domain.study_rental.entity.StudyRoom;
import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRentalRepository;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.security.principal.AuthUser;

@ExtendWith(MockitoExtension.class)
class StudyRentalCommandServiceTest {

    @InjectMocks
    private StudyRentalCommandService studyRentalCommandService;

    @Mock
    private StudyRoomRentalRepository rentalRepository;

    @Mock
    private StudyRoomRepository roomRepository;

    @Mock
    private AccountRepository accountRepository;

    @Test
    @DisplayName("예약 신청 성공")
    void applyRental_Success() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(1L);

        RentalApplyRequest request = new RentalApplyRequest();
        ReflectionTestUtils.setField(request, "roomId", 100L);
        ReflectionTestUtils.setField(request, "rentalDate", LocalDate.of(2026, 1, 1));
        ReflectionTestUtils.setField(request, "startTime", LocalTime.of(10, 0));
        ReflectionTestUtils.setField(request, "endTime", LocalTime.of(12, 0));

        Account applicant = mock(Account.class);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(applicant));

        StudyRoom room = StudyRoom.builder().build();
        ReflectionTestUtils.setField(room, "id", 100L);
        when(roomRepository.findById(100L)).thenReturn(Optional.of(room));

        when(rentalRepository.findOverlappingRentals(anyLong(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        // when
        studyRentalCommandService.applyRental(principal, request);

        // then
        verify(rentalRepository).save(any(StudyRoomRental.class));
    }

    @Test
    @DisplayName("예약 신청 실패 - 시간이 겹침")
    void applyRental_Fail_Overlapped() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(1L);

        RentalApplyRequest request = new RentalApplyRequest();
        ReflectionTestUtils.setField(request, "roomId", 100L);
        ReflectionTestUtils.setField(request, "rentalDate", LocalDate.of(2026, 1, 1));
        ReflectionTestUtils.setField(request, "startTime", LocalTime.of(10, 0));
        ReflectionTestUtils.setField(request, "endTime", LocalTime.of(12, 0));

        Account applicant = mock(Account.class);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(applicant));

        StudyRoom room = StudyRoom.builder().build();
        ReflectionTestUtils.setField(room, "id", 100L);
        when(roomRepository.findById(100L)).thenReturn(Optional.of(room));

        StudyRoomRental overlappedRental = StudyRoomRental.builder().build();
        when(rentalRepository.findOverlappingRentals(anyLong(), any(), any(), any()))
                .thenReturn(List.of(overlappedRental));

        // when & then
        assertThrows(BusinessException.class, () -> studyRentalCommandService.applyRental(principal, request));
        verify(rentalRepository, never()).save(any(StudyRoomRental.class));
    }

    @Test
    @DisplayName("예약 신청 실패 - 끝나는 시간이 시작 시간보다 앞섬")
    void applyRental_Fail_InvalidTime() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(1L);

        RentalApplyRequest request = new RentalApplyRequest();
        ReflectionTestUtils.setField(request, "roomId", 100L);
        ReflectionTestUtils.setField(request, "rentalDate", LocalDate.of(2026, 1, 1));
        ReflectionTestUtils.setField(request, "startTime", LocalTime.of(12, 0));
        ReflectionTestUtils.setField(request, "endTime", LocalTime.of(10, 0));

        Account applicant = mock(Account.class);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(applicant));

        StudyRoom room = StudyRoom.builder().build();
        ReflectionTestUtils.setField(room, "id", 100L);
        when(roomRepository.findById(100L)).thenReturn(Optional.of(room));

        // when & then
        assertThrows(BusinessException.class, () -> studyRentalCommandService.applyRental(principal, request));
        verify(rentalRepository, never()).save(any(StudyRoomRental.class));
    }

    @Test
    @DisplayName("예약 승인 성공")
    void processRental_Approve_Success() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(2L); // 관리자

        RentalProcessRequest request = new RentalProcessRequest();
        ReflectionTestUtils.setField(request, "status", RentalStatus.APPROVED);

        Account processor = mock(Account.class);
        when(accountRepository.findById(2L)).thenReturn(Optional.of(processor));

        StudyRoom room = StudyRoom.builder().build();
        ReflectionTestUtils.setField(room, "id", 100L);

        StudyRoomRental rental = StudyRoomRental.builder()
                .studyRoom(room)
                .status(RentalStatus.REQUESTED)
                .build();
        ReflectionTestUtils.setField(rental, "id", 1L);

        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));
        when(rentalRepository.findOverlappingRentals(anyLong(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        // when
        studyRentalCommandService.processRental(principal, 1L, request);

        // then
        assertEquals(RentalStatus.APPROVED, rental.getStatus());
        assertEquals(processor, rental.getProcessor());
    }

    @Test
    @DisplayName("예약 거절 성공")
    void processRental_Reject_Success() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(2L); // 관리자

        RentalProcessRequest request = new RentalProcessRequest();
        ReflectionTestUtils.setField(request, "status", RentalStatus.REJECTED);
        ReflectionTestUtils.setField(request, "rejectionReason", "거절사유");

        Account processor = mock(Account.class);
        when(accountRepository.findById(2L)).thenReturn(Optional.of(processor));

        StudyRoomRental rental = StudyRoomRental.builder()
                .status(RentalStatus.REQUESTED)
                .build();
        ReflectionTestUtils.setField(rental, "id", 1L);

        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));

        // when
        studyRentalCommandService.processRental(principal, 1L, request);

        // then
        assertEquals(RentalStatus.REJECTED, rental.getStatus());
        assertEquals("거절사유", rental.getRejectionReason());
        assertEquals(processor, rental.getProcessor());
    }

    @Test
    @DisplayName("예약 처리 실패 - 시간이 겹침")
    void processRental_Fail_Overlapped() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(2L); // 관리자

        RentalProcessRequest request = new RentalProcessRequest();
        ReflectionTestUtils.setField(request, "status", RentalStatus.APPROVED);

        Account processor = mock(Account.class);
        when(accountRepository.findById(2L)).thenReturn(Optional.of(processor));

        StudyRoom room = StudyRoom.builder().build();
        ReflectionTestUtils.setField(room, "id", 100L);

        StudyRoomRental rental = StudyRoomRental.builder()
                .studyRoom(room)
                .status(RentalStatus.REQUESTED)
                .build();
        ReflectionTestUtils.setField(rental, "id", 1L);

        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));

        StudyRoomRental overlappedRental = StudyRoomRental.builder().build();
        when(rentalRepository.findOverlappingRentals(anyLong(), any(), any(), any()))
                .thenReturn(List.of(overlappedRental));

        // when & then
        assertThrows(BusinessException.class, () -> studyRentalCommandService.processRental(principal, 1L, request));
        assertEquals(RentalStatus.REQUESTED, rental.getStatus());
    }

    @Test
    @DisplayName("예약 취소 성공 (본인)")
    void cancelRental_Success() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(1L);

        Account applicant = mock(Account.class);
        when(applicant.getAccountId()).thenReturn(1L);

        StudyRoomRental rental = StudyRoomRental.builder()
                .applicant(applicant)
                .status(RentalStatus.REQUESTED)
                .build();
        ReflectionTestUtils.setField(rental, "id", 1L);

        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));

        // when
        studyRentalCommandService.cancelRental(principal, 1L);

        // then
        assertEquals(RentalStatus.CANCELED, rental.getStatus());
    }

    @Test
    @DisplayName("예약 취소 실패 - 거절된 예약 취소 불가")
    void cancelRental_Fail_AlreadyRejected() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(1L);

        Account applicant = mock(Account.class);
        when(applicant.getAccountId()).thenReturn(1L);

        StudyRoomRental rental = StudyRoomRental.builder()
                .applicant(applicant)
                .status(RentalStatus.REJECTED)
                .build();
        ReflectionTestUtils.setField(rental, "id", 1L);

        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));

        // when & then
        assertThrows(BusinessException.class, () -> studyRentalCommandService.cancelRental(principal, 1L));
    }

    @Test
    @DisplayName("예약 취소 실패 - 취소된 예약 취소 불가")
    void cancelRental_Fail_AlreadyCanceled() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(1L);

        Account applicant = mock(Account.class);
        when(applicant.getAccountId()).thenReturn(1L);

        StudyRoomRental rental = StudyRoomRental.builder()
                .applicant(applicant)
                .status(RentalStatus.CANCELED)
                .build();
        ReflectionTestUtils.setField(rental, "id", 1L);

        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));

        // when & then
        assertThrows(BusinessException.class, () -> studyRentalCommandService.cancelRental(principal, 1L));
    }

    @Test
    @DisplayName("예약 취소 실패 - 타인 예약")
    void cancelRental_Fail_Forbidden() {
        // given
        AuthUser principal = mock(AuthUser.class);
        when(principal.getAccountId()).thenReturn(2L); // 사용자 2

        Account applicant = mock(Account.class);
        when(applicant.getAccountId()).thenReturn(1L); // 예약자는 사용자 1

        StudyRoomRental rental = StudyRoomRental.builder()
                .applicant(applicant)
                .build();
        ReflectionTestUtils.setField(rental, "id", 1L);

        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));

        // when & then
        assertThrows(BusinessException.class, () -> studyRentalCommandService.cancelRental(principal, 1L));
    }
}
