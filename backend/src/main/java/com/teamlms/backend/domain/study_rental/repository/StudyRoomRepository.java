package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.entity.StudyRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyRoomRepository extends JpaRepository<StudyRoom, Long> {

    // 1. 관리자용: 활성 여부 상관없이 특정 공간의 모든 룸 조회
    List<StudyRoom> findByStudySpaceId(Long spaceId);

    // 2. 학생용: 특정 공간의 '활성화된(Active)' 룸만 조회
    List<StudyRoom> findByStudySpaceIdAndIsActiveTrue(Long spaceId);

    // // 3. 공간 삭제 시 연관된 룸 일괄 삭제
    void deleteByStudySpaceId(Long spaceId);
    


}