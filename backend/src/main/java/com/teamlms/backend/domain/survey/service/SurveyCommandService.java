package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.alarm.enums.AlarmType;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
import com.teamlms.backend.domain.survey.api.dto.SurveyCreateRequest;
import com.teamlms.backend.domain.survey.api.dto.SurveyQuestionDto;
import com.teamlms.backend.domain.survey.api.dto.SurveyTargetFilterDto;
import com.teamlms.backend.domain.survey.api.dto.SurveyPatchRequest;
import com.teamlms.backend.domain.survey.entity.*;
import com.teamlms.backend.domain.survey.enums.*;
import com.teamlms.backend.domain.survey.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
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
    private final AlarmCommandService alarmCommandService;
    private final ObjectMapper objectMapper;

    // 1. 설문 생성
    public void createAndPublishSurvey(Long accountId, SurveyCreateRequest request) {
        validateQuestionOptions(request.questions());

        if (request.endAt().isBefore(request.startAt())) {
            throw new BusinessException(ErrorCode.SURVEY_DATE_INVALID);
        }

        String targetMemo = request.targetFilter() != null
                ? serializeTargetFilter(request.targetFilter())
                : null;

        Survey survey = Survey.builder()
                .type(request.type())
                .title(request.title())
                .description(request.description())
                .startAt(request.startAt())
                .endAt(request.endAt())
                .status(SurveyStatus.OPEN)
                .targetGenType(request.targetFilter() != null ? request.targetFilter().genType() : SurveyTargetGenType.ALL)
                .targetConditionMemo(targetMemo)
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
            List<Account> targets = resolveTargets(request.targetFilter());
            if (!targets.isEmpty()) {
                createTargetSnapshot(savedSurvey, targets);
                notifySurveyCreated(savedSurvey, targets);
            }
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
            // 응답자가 있으면(제출됨) 제목/기간 변경이나 질문 삭제/재생성 등이
            // 응답 데이터와 불일치 문제를 만들 수 있음.
            // 현재 구현은 전체 질문을 삭제 후 재생성하는 방식이므로,
            // 응답이 하나라도 있으면 설문 전체 수정은 막는 정책으로 처리.
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

    private List<Account> resolveTargets(SurveyTargetFilterDto filter) {
        if (filter == null) {
            return Collections.emptyList();
        }

        SurveyTargetGenType genType = filter.genType() != null ? filter.genType() : SurveyTargetGenType.ALL;

        if (genType == SurveyTargetGenType.ALL) {
            return accountRepository.findAllByAccountType(AccountType.STUDENT);
        } else if (genType == SurveyTargetGenType.DEPT) {
            return selectByDepts(filter.deptIds());
        } else if (genType == SurveyTargetGenType.GRADE) {
            return selectByGrades(filter.gradeLevels());
        } else if (genType == SurveyTargetGenType.DEPT_GRADE) {
            return selectByDeptAndGrades(filter.deptIds(), filter.gradeLevels());
        }

        // USER (직접 개별 선택)
        if (filter.userIds() != null && !filter.userIds().isEmpty()) {
            return accountRepository.findAllById(filter.userIds());
        }

        return Collections.emptyList();
    }

    private void createTargetSnapshot(Survey survey, List<Account> targets) {
        if (survey == null || targets == null || targets.isEmpty()) {
            return;
        }

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

    private void notifySurveyCreated(Survey survey, List<Account> targets) {
        if (survey == null || targets == null || targets.isEmpty()) {
            return;
        }

        String title = survey.getTitle();
        String titleKey = (title == null || title.isBlank()) ? "survey.alarm.title.default" : null;
        String message = buildSurveyMessage(survey.getDescription());
        String messageKey = message == null ? "survey.alarm.message.default" : null;
        String linkUrl = "/surveys/" + survey.getSurveyId();

        targets.stream()
                .map(Account::getAccountId)
                .filter(id -> id != null)
                .distinct()
                .forEach(recipientId -> alarmCommandService.createAlarmI18n(
                        recipientId,
                        AlarmType.SURVEY_NEW,
                        titleKey,
                        messageKey,
                        null,
                        linkUrl,
                        title,
                        message));
    }

    private String buildSurveyMessage(String description) {
        if (description == null) {
            return null;
        }

        String normalized = description.replaceAll("<[^>]*>", " ");
        normalized = normalized.replaceAll("\\s+", " ").trim();
        if (normalized.isEmpty()) {
            return null;
        }

        int maxLen = 80;
        if (normalized.length() <= maxLen) {
            return normalized;
        }

        return normalized.substring(0, maxLen) + "...";
    }

    private List<Account> selectByDepts(List<Long> deptIds) {
        if (deptIds == null || deptIds.isEmpty()) return Collections.emptyList();
        return accountRepository.findAllByDeptIdIn(deptIds);
    }

    private List<Account> selectByGrades(List<Integer> grades) {
        if (grades == null || grades.isEmpty()) return Collections.emptyList();
        return accountRepository.findAllByGradeLevelIn(grades);
    }

    private String serializeTargetFilter(SurveyTargetFilterDto filter) {
        try {
            return objectMapper.writeValueAsString(filter);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.SURVEY_TARGET_FILTER_SERIALIZE_FAILED);
        }
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