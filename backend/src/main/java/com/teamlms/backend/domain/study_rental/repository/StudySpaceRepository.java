package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.entity.StudySpace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudySpaceRepository extends JpaRepository<StudySpace, Long> {
    
    // 기본 활성 상태 조회
    List<StudySpace> findAllByIsActiveTrue();
    // 키워드 검색 (이름 포함 + 활성 상태)
    List<StudySpace> findBySpaceNameContainingAndIsActiveTrue(String spaceName);
    // 위치 검색 (위치 포함 + 활성 상태)
    List<StudySpace> findByLocationContainingAndIsActiveTrue(String location);
}