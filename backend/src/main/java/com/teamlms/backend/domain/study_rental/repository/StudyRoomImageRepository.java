package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.entity.StudyRoomImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyRoomImageRepository extends JpaRepository<StudyRoomImage, Long> {
    
    // 룸 ID로 이미지 조회 (순서 보장)
    List<StudyRoomImage> findByRoomIdOrderBySortOrderAsc(Long roomId);

    // 썸네일용 (순서가 0번이거나 가장 빠른 1장 가져오기)
    StudyRoomImage findFirstByRoomIdOrderBySortOrderAsc(Long roomId);
}