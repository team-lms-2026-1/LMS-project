package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.survey.api.dto.SurveyCreateRequest;
import com.teamlms.backend.domain.survey.api.dto.SurveyQuestionDto;
import com.teamlms.backend.domain.survey.api.dto.SurveyTargetFilterDto;
import com.teamlms.backend.domain.survey.api.dto.SurveyPatchRequest;
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
    public void createAndPublishSurvey(Long accountId, SurveyCreateRequest request) {
        validateQuestionOptions(request.questions());

        if (request.endAt().isBefore(request.startAt())) {
            throw new BusinessException(ErrorCode.SURVEY_DATE_INVALID);
        }

        Survey survey = Survey.builder()
                .type(request.type())
                .title(request.title())
                .description(request.description())
                .startAt(request.startAt())
                .endAt(request.endAt())
                .status(SurveyStatus.OPEN)
                .targetGenType(request.targetFilter() != null ? request.targetFilter().genType() : SurveyTargetGenType.ALL)
                .build();

        Survey savedSurvey = surveyRepository.save(survey);

        List<SurveyQuestion> questions = request.questions().stream()
                .map(q -> SurveyQuestion.builder()
                        .surveyId(savedSurvey.getSurveyId())
                        .questionText(q.questionText())
                        .sortOrder(q.sortOrder())
                        .minVal(q.minVal())
                        .maxVal(q.maxVal())
                        .minLabel(q.minLabel())
                        .maxLabel(q.maxLabel())
                        .isRequired(q.isRequired())
                        .questionType(q.questionType() != null ? q.questionType() : SurveyQuestionType.RATING)
                        .options(q.options())
                        .build())
                .collect(Collectors.toList());

        questionRepository.saveAll(questions);
        if (request.targetFilter() != null) {
            createTargetSnapshot(savedSurvey, request.targetFilter());
        }

    }

    // 2. 설문 수정
    public void patchSurvey(Long surveyId, SurveyPatchRequest request) {
        validateQuestionOptions(request.questions());

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND, surveyId));

        if (request.endAt().isBefore(request.startAt())) {
            throw new BusinessException(ErrorCode.SURVEY_DATE_INVALID);
        }

        if (targetRepository.countBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED) > 0) {
            // 제목이나 기간은 수정할 수 있어도 질문을 삭제/재생성하는 것은 문제될 수 있음.
            // 여기서는 전체 수정 시 질문 삭제 로직이 있으므로, 응답이 있으면 전체 수정을 막거나 질문 부분만 제한해야 함.
            // 일단 질문 목록이 바뀌었는지 체크하고 바뀌었으면 막는 것이 좋으나, 간단히 응답 있으면 수정 불가로 처리.
            throw new BusinessException(ErrorCode.SURVEY_HAS_RESPONSES);
        }

        survey.update(
                request.title(),
                request.description(),
                request.startAt(),
                request.endAt(),
                request.type());

        // 기존 질문 삭제
        questionRepository.deleteAllBySurveyId(surveyId);
        questionRepository.flush();

        if (request.questions() != null && !request.questions().isEmpty()) {
            List<SurveyQuestion> newQuestions = new ArrayList<>();
            int order = 1;

            for (SurveyQuestionDto q : request.questions()) {
                newQuestions.add(SurveyQuestion.builder()
                        .surveyId(survey.getSurveyId())
                        .questionText(q.questionText())
                        .sortOrder(order++)
                        .minVal(q.minVal()).maxVal(q.maxVal())
                        .minLabel(q.minLabel()).maxLabel(q.maxLabel())
                        .isRequired(q.isRequired())
                        .questionType(q.questionType() != null ? q.questionType() : SurveyQuestionType.RATING)
                        .options(q.options())
                        .build());
            }
            questionRepository.saveAll(newQuestions);
        }
    }

    // 3. 설문 삭제
    public void deleteSurvey(Long surveyId) {

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND, surveyId));

        targetRepository.deleteAllBySurveyId(surveyId);
        questionRepository.deleteAllBySurveyId(surveyId);
        surveyRepository.delete(survey);
    }

    private void createTargetSnapshot(Survey survey, SurveyTargetFilterDto filter) {
        List<Account> targets;
        SurveyTargetGenType genType = filter.genType() != null ? filter.genType() : SurveyTargetGenType.ALL;

        if (genType == SurveyTargetGenType.ALL) {
            targets = accountRepository.findAllByAccountType(AccountType.STUDENT);
        } else if (genType == SurveyTargetGenType.DEPT) {
            targets = selectByDepts(filter.deptIds());
        } else if (genType == SurveyTargetGenType.GRADE) {
            targets = selectByGrades(filter.gradeLevels());
        } else if (genType == SurveyTargetGenType.DEPT_GRADE) {
            targets = selectByDeptAndGrades(filter.deptIds(), filter.gradeLevels());
        } else {
            // USER (직접 개별 선택)
            if (filter.userIds() != null && !filter.userIds().isEmpty()) {
                targets = accountRepository.findAllById(filter.userIds());
            } else {
                targets = Collections.emptyList();
            }
        }

        if (targets.isEmpty()) return;

        List<SurveyTarget> surveyTargets = targets.stream()
                .map(account -> SurveyTarget.builder()
                        .surveyId(survey.getSurveyId())
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
            throw new BusinessException(ErrorCode.SURVEY_QUESTIONS_EMPTY);
        }

        for (SurveyQuestionDto q : questions) {
            // 객관식 질문인 경우 옵션 검증
            if (q.questionType() == SurveyQuestionType.MULTIPLE_CHOICE ||
                    q.questionType() == SurveyQuestionType.SINGLE_CHOICE) {

                // 옵션이 없는 경우
                if (q.options() == null || q.options().isEmpty()) {
                    throw new BusinessException(ErrorCode.SURVEY_OPTIONS_REQUIRED);
                }

                // 빈 옵션이 있는지 확인
                for (String option : q.options()) {
                    if (option == null || option.trim().isEmpty()) {
                        throw new BusinessException(ErrorCode.SURVEY_OPTIONS_REQUIRED);
                    }
                }
            }
        }
    }


}