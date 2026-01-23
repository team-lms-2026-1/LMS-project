package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.entity.StudySpaceRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudySpaceRuleRepository extends JpaRepository<StudySpaceRule, Long> {
    
    // 공간 ID로 조회하되, 순서(sortOrder) 오름차순 정렬
    List<StudySpaceRule> findBySpaceIdOrderBySortOrderAsc(Long spaceId);
    
    // 특정 공간의 규칙 전체 삭제 (공간 삭제 시 사용)
    void deleteBySpaceId(Long spaceId);
}