package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.api.dto.SurveyListResponse;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SurveyRepositoryCustom {

    Page<SurveyListResponse> findSurveyAdminList(
        SurveyType type,
        SurveyStatus status,
        String keyword,
        Pageable pageable
    );

    // returns list of surveys available for the specific user
    Page<SurveyListResponse> findAvailableSurveysForUser(
        Long userId,
        String keyword,
        SurveyType type,
        Pageable pageable
    );
}
