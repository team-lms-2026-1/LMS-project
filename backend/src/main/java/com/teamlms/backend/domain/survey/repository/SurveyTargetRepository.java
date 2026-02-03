package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.entity.SurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface SurveyTargetRepository extends JpaRepository<SurveyTarget, Long> {

    // 특정 설문에 대해 내가 대상자인지 조회 (단건)
    Optional<SurveyTarget> findBySurveyIdAndTargetAccountId(Long surveyId, Long targetAccountId);

    // 내가 참여해야 할(미참여 상태인) 설문 목록 조회
    // -> 여기서 나온 surveyId 리스트로 SurveyRepository 조회
    List<SurveyTarget> findByTargetAccountIdAndStatus(Long targetAccountId, SurveyTargetStatus status);

    // 설문 ID로 딸린 대상자 모두 삭제
    void deleteAllBySurveyId(Long surveyId);

    // 전체 대상자 수 카운트
    long countBySurveyId(Long surveyId);

    // 상태별(제출완료) 카운트
    long countBySurveyIdAndStatus(Long surveyId, SurveyTargetStatus status);

    // 특정 설문의 참여자 목록 조회 (페이징)
    Page<SurveyTarget> findBySurveyId(Long surveyId, Pageable pageable);

    // [추가] 특정 설문의 상태별 참여자 전체 목록 (통계용 쿼리)
    List<SurveyTarget> findAllBySurveyIdAndStatus(Long surveyId, SurveyTargetStatus status);
}