package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SurveyRepository extends JpaRepository<Survey, Long>, JpaSpecificationExecutor<Survey>, SurveyRepositoryCustom {
}
