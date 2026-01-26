package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.entity.StudySpaceImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudySpaceImageRepository extends JpaRepository<StudySpaceImage, Long> {

    // 공간별 이미지 조회 (순서 오름차순 정렬)
    List<StudySpaceImage> findByStudySpaceIdOrderBySortOrderAsc(Long spaceId);

    // 공간 삭제 시 이미지 일괄 삭제
    void deleteByStudySpaceId(Long spaceId);
}