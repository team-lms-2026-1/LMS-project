package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.survey.api.dto.*; // 외부 DTO
import com.teamlms.backend.domain.survey.dto.InternalSurveySearchRequest; // 내부 DTO
import com.teamlms.backend.domain.survey.entity.*;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurveyQueryService {

    private final SurveyRepository surveyRepository;
    private final SurveyQuestionRepository questionRepository;
    private final SurveyTargetRepository targetRepository;

    // 관리자 목록 조회
    public Page<SurveyListResponse> getSurveyList(InternalSurveySearchRequest request, Pageable pageable) {
        Page<Survey> surveys = surveyRepository.findAll(pageable); // 실제 구현 시 Specification 사용
        return surveys.map(this::toSurveyListResponse);
    }

    // 사용자 참여 가능 목록
    public List<SurveyListResponse> getAvailableSurveys(Long userId) {
        List<SurveyTarget> targets = targetRepository.findByTargetAccountIdAndStatus(userId, SurveyTargetStatus.PENDING);
        List<Long> surveyIds = targets.stream().map(SurveyTarget::getSurveyId).toList();
        
        List<Survey> surveys = surveyRepository.findAllById(surveyIds);
        return surveys.stream().map(this::toSurveyListResponse).collect(Collectors.toList());
    }

    // 상세 조회
    public SurveyDetailResponse getSurveyDetail(Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        List<SurveyQuestion> questions = questionRepository.findBySurveyIdOrderBySortOrderAsc(surveyId);

        return toSurveyDetailResponse(survey, questions);
    }

    // --- Mappers ---
    private SurveyListResponse toSurveyListResponse(Survey survey) {
        return SurveyListResponse.builder()
                .surveyId(survey.getId())
                .type(survey.getType())
                .title(survey.getTitle())
                .status(survey.getStatus())
                .startAt(survey.getStartAt())
                .endAt(survey.getEndAt())
                .build();
    }

    private SurveyDetailResponse toSurveyDetailResponse(Survey survey, List<SurveyQuestion> questions) {
        return SurveyDetailResponse.builder()
                .surveyId(survey.getId())
                .type(survey.getType())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .status(survey.getStatus())
                .startAt(survey.getStartAt())
                .endAt(survey.getEndAt())
                .questions(questions.stream().map(this::toQuestionResponse).collect(Collectors.toList()))
                .build();
    }

    private SurveyDetailResponse.QuestionResponseDto toQuestionResponse(SurveyQuestion question) {
        return SurveyDetailResponse.QuestionResponseDto.builder()
                .questionId(question.getId())
                .questionText(question.getQuestionText())
                .sortOrder(question.getSortOrder())
                .minVal(question.getMinVal())
                .maxVal(question.getMaxVal())
                .minLabel(question.getMinLabel())
                .maxLabel(question.getMaxLabel())
                .isRequired(question.getIsRequired())
                .build();
    }
}