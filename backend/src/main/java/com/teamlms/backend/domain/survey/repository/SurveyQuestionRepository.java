package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Long> {
    
    // 설문 ID로 문항 조회 (정렬 순서 보장)
    List<SurveyQuestion> findBySurveyIdOrderBySortOrderAsc(Long surveyId);
}