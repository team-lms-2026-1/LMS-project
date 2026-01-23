package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.entity.SurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SurveyTargetRepository extends JpaRepository<SurveyTarget, Long> {

    // 1. 특정 설문에 대해 내가 대상자인지 조회 (단건)
    Optional<SurveyTarget> findBySurveyIdAndTargetAccountId(Long surveyId, Long targetAccountId);

    // 2. 내가 참여해야 할(미참여 상태인) 설문 목록 조회
    //    -> 여기서 나온 surveyId 리스트로 SurveyRepository 조회
    List<SurveyTarget> findByTargetAccountIdAndStatus(Long targetAccountId, SurveyTargetStatus status);

    // 3. 특정 설문의 참여 현황 통계용 (예: 제출된 것만 카운트)
    long countBySurveyIdAndStatus(Long surveyId, SurveyTargetStatus status);
}