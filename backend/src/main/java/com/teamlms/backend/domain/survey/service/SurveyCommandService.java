package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.survey.api.dto.SurveyCreateRequest;
import com.teamlms.backend.domain.survey.api.dto.SurveyUpdateRequest;
import com.teamlms.backend.domain.survey.entity.*;
import com.teamlms.backend.domain.survey.enums.*;
import com.teamlms.backend.domain.survey.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList; // [추가]
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SurveyCommandService {

    private final SurveyRepository surveyRepository;
    private final SurveyQuestionRepository questionRepository;
    private final SurveyTargetRepository targetRepository;
    private final AccountRepository accountRepository;

    // 1. 설문 생성
    public Long createAndPublishSurvey(Long adminId, SurveyCreateRequest request) {
        validateAdmin(adminId);

        Survey survey = Survey.builder()
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .status(SurveyStatus.OPEN)
                .targetGenType(request.getTargetFilter().getGenType())
                .build();
        
        Survey savedSurvey = surveyRepository.save(survey);

        List<SurveyQuestion> questions = request.getQuestions().stream()
                .map(q -> SurveyQuestion.builder()
                        .surveyId(savedSurvey.getId())
                        .questionText(q.getQuestionText())
                        .sortOrder(q.getSortOrder())
                        .minVal(q.getMinVal())
                        .maxVal(q.getMaxVal())
                        .minLabel(q.getMinLabel())
                        .maxLabel(q.getMaxLabel())
                        .isRequired(q.getIsRequired())
                        .build())
                .collect(Collectors.toList());
        
        questionRepository.saveAll(questions);
        createTargetSnapshot(savedSurvey, request.getTargetFilter());

        return savedSurvey.getId();
    }

    // 2. 설문 수정
    public void updateSurvey(Long adminId, Long surveyId, SurveyUpdateRequest request) {
        validateAdmin(adminId);

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        survey.update(
                request.getTitle(),
                request.getDescription(),
                request.getStartAt(),
                request.getEndAt()
        );

        // 기존 질문 삭제
        questionRepository.deleteAllBySurveyId(surveyId);
        questionRepository.flush();

        
        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            List<SurveyQuestion> newQuestions = new ArrayList<>();
            int order = 1;

            for (SurveyCreateRequest.QuestionDto q : request.getQuestions()) {
                newQuestions.add(SurveyQuestion.builder()
                        .surveyId(survey.getId())
                        .questionText(q.getQuestionText())
                        .sortOrder(order++) 
                        .minVal(q.getMinVal()).maxVal(q.getMaxVal())
                        .minLabel(q.getMinLabel()).maxLabel(q.getMaxLabel())
                        .isRequired(q.getIsRequired())
                        .build());
            }
            questionRepository.saveAll(newQuestions);
        }
    }

    // 3. 설문 삭제
    public void deleteSurvey(Long adminId, Long surveyId) {
        validateAdmin(adminId);

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        targetRepository.deleteAllBySurveyId(surveyId);
        questionRepository.deleteAllBySurveyId(surveyId);
        surveyRepository.delete(survey);
    }

    private void createTargetSnapshot(Survey survey, SurveyCreateRequest.TargetFilterDto filter) {
        List<Account> targets;
        
        if ("ALL".equals(filter.getGenType())) {
            targets = accountRepository.findAll();
        } else if ("DEPT".equals(filter.getGenType())) {
            targets = accountRepository.findAllByDeptIdIn(filter.getDeptIds());
        } else {
            targets = accountRepository.findAllById(filter.getUserIds());
        }

        List<SurveyTarget> surveyTargets = targets.stream()
                .map(account -> SurveyTarget.builder()
                        .surveyId(survey.getId())
                        .targetAccountId(account.getAccountId())
                        .status(SurveyTargetStatus.PENDING)
                        .invitedAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        targetRepository.saveAll(surveyTargets);
    }

    private void validateAdmin(Long adminId) {
        Account admin = accountRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (!"ADMIN".equals(admin.getAccountType().name())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}