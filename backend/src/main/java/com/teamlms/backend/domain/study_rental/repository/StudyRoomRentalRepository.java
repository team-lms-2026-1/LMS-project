package com.teamlms.backend.domain.study_rental.repository;

// import com.teamlms.backend.domain.study_rental.dto.RentalSearchCondition;
// import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;

// import java.time.LocalDateTime;
// import java.util.List;

// public interface StudyRoomRentalRepository extends JpaRepository<StudyRoomRental, Long> {

//     /**
//      * [중복 예약 체크]
//      * 특정 룸(roomId)에 대해 요청한 시간(startAt ~ endAt)과 겹치는 'APPROVED(승인된)' 예약 조회
//      * 겹침 조건: (기존예약시작 < 요청종료) AND (기존예약종료 > 요청시작)
//      */
//     @Query("SELECT r FROM StudyRoomRental r " +
//            "WHERE r.studyRoom.id = :roomId " +
//            "AND r.status = :status " +
//            "AND r.startAt < :endAt " +
//            "AND r.endAt > :startAt")
//     List<StudyRoomRental> findOverlappingRentals(@Param("roomId") Long roomId,
//                                                  @Param("startAt") LocalDateTime startAt,
//                                                  @Param("endAt") LocalDateTime endAt);

//     /**
//      * [예약 내역 검색]
//      * - 관리자: 키워드(공간명, 신청자ID) 검색, 상태 필터링, 공간별 필터링
//      * - 학생: 본인 예약(applicantId) 필터링
//      * - 성능 최적화: JOIN FETCH를 사용하여 Space, Room, Applicant 정보를 한 번에 조회 (N+1 문제 해결)
//      */
//     @Query("SELECT r FROM StudyRoomRental r " +
//            "JOIN FETCH r.studyRoom room " +
//            "JOIN FETCH room.studySpace space " +
//            "JOIN FETCH r.applicant applicant " +
//            "WHERE (:#{#cond.spaceId} IS NULL OR space.id = :#{#cond.spaceId}) " +
//            "AND (:#{#cond.applicantId} IS NULL OR applicant.id = :#{#cond.applicantId}) " +
//            "AND (:#{#cond.status} IS NULL OR r.status = :#{#cond.status}) " +
//            "AND (:#{#cond.keyword} IS NULL OR " +
//            "    space.spaceName LIKE %:#{#cond.keyword}% OR " +
//            "    CAST(applicant.id AS string) LIKE %:#{#cond.keyword}%)") 
//     Page<StudyRoomRental> search(@Param("cond") RentalSearchCondition cond, Pageable pageable);
// }

import com.teamlms.backend.domain.study_rental.dto.RentalSearchCondition;
import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus; // [필수] Enum 임포트 확인!
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StudyRoomRentalRepository extends JpaRepository<StudyRoomRental, Long> {
       void deleteByStudyRoomId(Long roomId);

    /**
     * 중복 예약 체크
     */
    @Query("SELECT r FROM StudyRoomRental r " +
           "WHERE r.studyRoom.id = :roomId " +
           "AND r.status = :status " +  
           "AND r.startAt < :endAt " +
           "AND r.endAt > :startAt")
    List<StudyRoomRental> findOverlappingRentals(
            @Param("roomId") Long roomId,
            @Param("status") RentalStatus status, 
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    /**
     * 예약 내역 검색
     */
    @Query("SELECT r FROM StudyRoomRental r " +
           "JOIN FETCH r.studyRoom room " +
           "JOIN FETCH room.studySpace space " +
           "JOIN FETCH r.applicant applicant " +
           "WHERE (:#{#cond.spaceId} IS NULL OR space.id = :#{#cond.spaceId}) " +
           "AND (:#{#cond.applicantId} IS NULL OR applicant.id = :#{#cond.applicantId}) " +
           "AND (:#{#cond.status} IS NULL OR r.status = :#{#cond.status}) " +
           "AND (:#{#cond.keyword} IS NULL OR " +
           "    space.spaceName LIKE %:#{#cond.keyword}% OR " +
           "    CAST(applicant.id AS string) LIKE %:#{#cond.keyword}%)")
    Page<StudyRoomRental> search(@Param("cond") RentalSearchCondition cond, Pageable pageable);
}