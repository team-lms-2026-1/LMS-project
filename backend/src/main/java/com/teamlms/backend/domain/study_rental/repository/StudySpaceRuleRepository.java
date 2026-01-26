package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.entity.StudySpaceRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudySpaceRuleRepository extends JpaRepository<StudySpaceRule, Long> {

    // 공간별 규칙 조회 (순서 오름차순 정렬)
    List<StudySpaceRule> findByStudySpaceIdOrderBySortOrderAsc(Long spaceId);

    // 공간 삭제 시 규칙 일괄 삭제
    void deleteByStudySpaceId(Long spaceId);
}