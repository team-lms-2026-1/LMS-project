package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.survey.api.dto.SurveyCreateRequest; // 외부 DTO
import com.teamlms.backend.domain.survey.entity.*;
import com.teamlms.backend.domain.survey.enums.*;
import com.teamlms.backend.domain.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    public Long createAndPublishSurvey(SurveyCreateRequest request) {
        // 1. Survey 저장
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

        // 2. Question 저장
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

        // 3. Target Snapshot 생성
        createTargetSnapshot(savedSurvey, request.getTargetFilter());

        return savedSurvey.getId();
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
}