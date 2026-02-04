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

    // 1. 설문 생성
    public Long createAndPublishSurvey(Long adminId, SurveyCreateRequest request) {
        try {
            System.out.println("DEBUG: createAndPublishSurvey called. Request: " + request);
            if (request.getTargetFilter() != null) {
                System.out.println("DEBUG: TargetFilter: " + request.getTargetFilter());
            }

            validateAdmin(adminId);
            validateQuestionOptions(request.getQuestions());

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
                            // [New]
                            .questionType(q.getQuestionType() != null ? q.getQuestionType() : SurveyQuestionType.RATING) // Default
                            .options(q.getOptions())
                            .build())
                    .collect(Collectors.toList());

            questionRepository.saveAll(questions);
            createTargetSnapshot(savedSurvey, request.getTargetFilter());

            return savedSurvey.getId();
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            // Re-throw if it's already a BusinessException, or wrap
            if (e instanceof BusinessException) {
                throw e;
            }
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
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

            for (SurveyCreateRequest.QuestionDto q : request.getQuestions()) {
                newQuestions.add(SurveyQuestion.builder()
                        .surveyId(survey.getId())
                        .questionText(q.getQuestionText())
                        .sortOrder(order++)
                        .minVal(q.getMinVal()).maxVal(q.getMaxVal())

                        .minLabel(q.getMinLabel()).maxLabel(q.getMaxLabel())
                        .isRequired(q.getIsRequired())
                        // [New]
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

    private void createTargetSnapshot(Survey survey, SurveyCreateRequest.TargetFilterDto filter) {
        List<Account> targets;
        String type = filter.getGenType(); // ALL, DEPT, GRADE, DEPT_GRADE

        System.out.println("DEBUG: GenType: " + type);

        if ("ALL".equals(type)) {
            targets = accountRepository.findAll();
        } else if ("DEPT".equals(type)) {
            // 학과별
            targets = selectByDepts(filter.getDeptIds());
        } else if ("GRADE".equals(type)) {
            // 학년별
            targets = selectByGrades(filter.getGradeLevels());
        } else if ("DEPT_GRADE".equals(type)) {
            // [추가] 복합 조건 (학과 AND 학년)
            targets = selectByDeptAndGrades(filter.getDeptIds(), filter.getGradeLevels());
        } else {
            // USER (직접 개별 선택)
            if (filter.getUserIds() != null && !filter.getUserIds().isEmpty()) {
                targets = accountRepository.findAllById(filter.getUserIds());
            } else {
                targets = Collections.emptyList();
            }
        }

        System.out.println("DEBUG: Found targets count: " + targets.size());

        if (targets.isEmpty())
            return;

        List<SurveyTarget> surveyTargets = targets.stream()
                .map(account -> SurveyTarget.builder()
                        .surveyId(survey.getId())
                        .targetAccountId(account.getAccountId())
                        .status(SurveyTargetStatus.PENDING)
                        .invitedAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        System.out.println("DEBUG: Saving targets...");
        targetRepository.saveAll(surveyTargets);
        System.out.println("DEBUG: Targets saved.");
    }

    private List<Account> selectByDepts(List<Long> deptIds) {
        if (deptIds == null || deptIds.isEmpty())
            return Collections.emptyList();
        return accountRepository.findAllByDeptIdIn(deptIds);
    }

    private List<Account> selectByGrades(List<Integer> grades) {
        if (grades == null || grades.isEmpty())
            return Collections.emptyList();
        return accountRepository.findAllByGradeLevelIn(grades);
    }

    private List<Account> selectByDeptAndGrades(List<Long> deptIds, List<Integer> grades) {
        if (deptIds == null || deptIds.isEmpty())
            return Collections.emptyList();
        if (grades == null || grades.isEmpty())
            return Collections.emptyList();
        System.out.println("DEBUG: Querying depts=" + deptIds + ", grades=" + grades);
        return accountRepository.findAllByDeptIdInAndGradeLevelIn(deptIds, grades);
    }

    private void validateQuestionOptions(List<SurveyCreateRequest.QuestionDto> questions) {
        if (questions == null || questions.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        for (int i = 0; i < questions.size(); i++) {
            SurveyCreateRequest.QuestionDto q = questions.get(i);

            // 객관식 질문인 경우 옵션 검증
            if (q.getQuestionType() == SurveyQuestionType.MULTIPLE_CHOICE ||
                    q.getQuestionType() == SurveyQuestionType.SINGLE_CHOICE) {

                // 옵션이 없는 경우
                if (q.getOptions() == null || q.getOptions().isEmpty()) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                }

                // 빈 옵션이 있는지 확인
                for (int j = 0; j < q.getOptions().size(); j++) {
                    String option = q.getOptions().get(j);
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

        if (!"ADMIN".equals(admin.getAccountType().name())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}