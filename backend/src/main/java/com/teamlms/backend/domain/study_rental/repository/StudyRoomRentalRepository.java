package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StudyRoomRentalRepository extends JpaRepository<StudyRoomRental, Long> {

    // 1. 사용자별 예약 내역 조회 (최신순)
    List<StudyRoomRental> findByApplicantAccountIdOrderByAppliedAtDesc(Long applicantAccountId);

    // 2. 룸별 예약 내역 조회 (관리자용, 날짜순)
    List<StudyRoomRental> findByRoomIdOrderByStartAtDesc(Long roomId);

    // 3. 상태별 조회 (예: 승인 대기중인 건만 조회)
    List<StudyRoomRental> findByStatus(RentalStatus status);

    /**
     * [중복 예약 체크 쿼리]
     * 요청한 시간(start ~ end)과 겹치는 '승인된(APPROVED)' 예약이 있는지 확인
     * 겹침 조건: (ExistingStart < RequestEnd) AND (ExistingEnd > RequestStart)
     */
    @Query("SELECT r FROM StudyRoomRental r " +
           "WHERE r.roomId = :roomId " +
           "AND r.status = 'APPROVED' " + // 승인된 예약만 중복으로 간주 (정책에 따라 변경 가능)
           "AND r.startAt < :endAt " +
           "AND r.endAt > :startAt")
    List<StudyRoomRental> findOverlappingRentals(@Param("roomId") Long roomId,
                                                 @Param("startAt") LocalDateTime startAt,
                                                 @Param("endAt") LocalDateTime endAt);
}