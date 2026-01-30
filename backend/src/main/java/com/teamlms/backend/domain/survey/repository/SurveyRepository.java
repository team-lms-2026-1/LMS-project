package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; 

public interface SurveyRepository extends JpaRepository<Survey, Long>, JpaSpecificationExecutor<Survey> {
    // JpaSpecificationExecutor는 검색 필터(Specification) 사용 시 필요
    // 단순 조회만 한다면 제거해도 무방
}