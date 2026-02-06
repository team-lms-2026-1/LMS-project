package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.survey.api.dto.SurveyCreateRequest;
import com.teamlms.backend.domain.survey.api.dto.SurveyQuestionDto;
import com.teamlms.backend.domain.survey.api.dto.SurveyTargetFilterDto;
import com.teamlms.backend.domain.survey.api.dto.SurveyUpdateRequest;
import com.teamlms.backend.domain.survey.entity.*;
import com.teamlms.backend.domain.survey.enums.*;
import com.teamlms.backend.domain.survey.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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
        validateQuestionOptions(request.getQuestions());

        Survey survey = Survey.builder()
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .status(SurveyStatus.OPEN)
                .targetGenType(SurveyTargetGenType.valueOf(request.getTargetFilter() != null ? request.getTargetFilter().getGenType() : "ALL"))
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
                        .questionType(q.getQuestionType() != null ? q.getQuestionType() : SurveyQuestionType.RATING)
                        .options(q.getOptions())
                        .build())
                .collect(Collectors.toList());

        questionRepository.saveAll(questions);
        if (request.getTargetFilter() != null) {
            createTargetSnapshot(savedSurvey, request.getTargetFilter());
        }

        return savedSurvey.getId();
    }

    // 2. 설문 수정
    public void updateSurvey(Long adminId, Long surveyId, SurveyUpdateRequest request) {
        validateAdmin(adminId);
        validateQuestionOptions(request.getQuestions());

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        survey.update(
                request.getTitle(),
                request.getDescription(),
                request.getStartAt(),
                request.getEndAt());

        // 기존 질문 삭제
        questionRepository.deleteAllBySurveyId(surveyId);
        questionRepository.flush();

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            List<SurveyQuestion> newQuestions = new ArrayList<>();
            int order = 1;

            for (SurveyQuestionDto q : request.getQuestions()) {
                newQuestions.add(SurveyQuestion.builder()
                        .surveyId(survey.getId())
                        .questionText(q.getQuestionText())
                        .sortOrder(order++)
                        .minVal(q.getMinVal()).maxVal(q.getMaxVal())
                        .minLabel(q.getMinLabel()).maxLabel(q.getMaxLabel())
                        .isRequired(q.getIsRequired())
                        .questionType(q.getQuestionType() != null ? q.getQuestionType() : SurveyQuestionType.RATING)
                        .options(q.getOptions())
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

    private void createTargetSnapshot(Survey survey, SurveyTargetFilterDto filter) {
        List<Account> targets;
        String type = filter.getGenType(); // ALL, DEPT, GRADE, DEPT_GRADE, USER

        if ("ALL".equals(type)) {
            targets = accountRepository.findAllByAccountType(AccountType.STUDENT);
        } else if ("DEPT".equals(type)) {
            targets = selectByDepts(filter.getDeptIds());
        } else if ("GRADE".equals(type)) {
            targets = selectByGrades(filter.getGradeLevels());
        } else if ("DEPT_GRADE".equals(type)) {
            targets = selectByDeptAndGrades(filter.getDeptIds(), filter.getGradeLevels());
        } else {
            // USER (직접 개별 선택)
            if (filter.getUserIds() != null && !filter.getUserIds().isEmpty()) {
                targets = accountRepository.findAllById(filter.getUserIds());
            } else {
                targets = Collections.emptyList();
            }
        }

        if (targets.isEmpty()) return;

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

    private List<Account> selectByDepts(List<Long> deptIds) {
        if (deptIds == null || deptIds.isEmpty()) return Collections.emptyList();
        return accountRepository.findAllByDeptIdIn(deptIds);
    }

    private List<Account> selectByGrades(List<Integer> grades) {
        if (grades == null || grades.isEmpty()) return Collections.emptyList();
        return accountRepository.findAllByGradeLevelIn(grades);
    }

    private List<Account> selectByDeptAndGrades(List<Long> deptIds, List<Integer> grades) {
        if (deptIds == null || deptIds.isEmpty()) return Collections.emptyList();
        if (grades == null || grades.isEmpty()) return Collections.emptyList();
        return accountRepository.findAllByDeptIdInAndGradeLevelIn(deptIds, grades);
    }

    private void validateQuestionOptions(List<SurveyQuestionDto> questions) {
        if (questions == null || questions.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        for (SurveyQuestionDto q : questions) {
            // 객관식 질문인 경우 옵션 검증
            if (q.getQuestionType() == SurveyQuestionType.MULTIPLE_CHOICE ||
                    q.getQuestionType() == SurveyQuestionType.SINGLE_CHOICE) {

                // 옵션이 없는 경우
                if (q.getOptions() == null || q.getOptions().isEmpty()) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                }

                // 빈 옵션이 있는지 확인
                for (String option : q.getOptions()) {
                    if (option == null || option.trim().isEmpty()) {
                        throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                    }
                }
            }
        }
    }

    private void validateAdmin(Long adminId) {
        Account admin = accountRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (admin.getAccountType() != AccountType.ADMIN) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}