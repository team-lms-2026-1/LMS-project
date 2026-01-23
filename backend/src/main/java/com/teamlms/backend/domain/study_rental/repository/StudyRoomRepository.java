package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.entity.StudyRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudyRoomRepository extends JpaRepository<StudyRoom, Long> {

    // 특정 공간의 모든 룸 조회
    List<StudyRoom> findBySpaceId(Long spaceId);

    // 특정 공간의 '활성화된' 룸만 조회
    List<StudyRoom> findBySpaceIdAndIsActiveTrue(Long spaceId);

    /**
     * [검색 조건 지원]
     * 인원수(min <= N <= max) 조건에 맞는 룸 조회
     */
    @Query("SELECT r FROM StudyRoom r " +
           "WHERE r.spaceId = :spaceId " +
           "AND r.isActive = true " +
           "AND r.minPeople <= :peopleCount " +
           "AND r.maxPeople >= :peopleCount")
    List<StudyRoom> findAvailableRoomsByPeople(@Param("spaceId") Long spaceId, 
                                               @Param("peopleCount") Integer peopleCount);
}