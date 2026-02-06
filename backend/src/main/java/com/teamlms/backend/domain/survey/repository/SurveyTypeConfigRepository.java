package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.entity.SurveyTypeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SurveyTypeConfigRepository extends JpaRepository<SurveyTypeConfig, String> {
    List<SurveyTypeConfig> findAllByIsActiveTrueOrderBySortOrderAsc();
}
