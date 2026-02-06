package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.survey.api.dto.*;
import com.teamlms.backend.domain.survey.entity.Survey;
import com.teamlms.backend.domain.survey.entity.SurveyQuestion;
import com.teamlms.backend.domain.survey.entity.SurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.repository.SurveyQuestionRepository;
import com.teamlms.backend.domain.survey.repository.SurveyRepository;
import com.teamlms.backend.domain.survey.repository.SurveyTargetRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurveyQueryService {

    private final SurveyRepository surveyRepository;
    private final SurveyQuestionRepository questionRepository;
    private final SurveyTargetRepository targetRepository;
    private final AccountRepository accountRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final DeptRepository deptRepository;

    // 관리자 목록 조회
    public Page<SurveyListResponse> getSurveyList(Long adminId, InternalSurveySearchRequest request, Pageable pageable) {
        validateAdmin(adminId);
        // Using custom repository method
        return surveyRepository.findSurveyAdminList(
                request.getType(),
                request.getStatus(),
                request.getKeyword(),
                pageable
        );
    }

    // 사용자 참여 가능 목록
    public List<SurveyListResponse> getAvailableSurveys(Long userId, String keyword) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        if ("PROFESSOR".equals(user.getAccountType().name())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // Using custom repository method
        return surveyRepository.findAvailableSurveysForUser(userId, keyword);
    }

    // 상세 조회
    @Transactional
    public SurveyDetailResponse getSurveyDetail(Long surveyId, Long userId) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        String role = user.getAccountType().name();

        if ("PROFESSOR".equals(role)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        if ("STUDENT".equals(role)) {
            boolean isTarget = targetRepository.findBySurveyIdAndTargetAccountId(surveyId, userId).isPresent();
            if (!isTarget) {
                throw new BusinessException(ErrorCode.SURVEY_NOT_TARGET);
            }
            
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if (now.isBefore(survey.getStartAt()) || now.isAfter(survey.getEndAt())) {
                 throw new BusinessException(ErrorCode.SURVEY_NOT_OPEN);
            }

            survey.increaseViewCount();
        }

        List<SurveyQuestion> questions = questionRepository.findBySurveyIdOrderBySortOrderAsc(surveyId);
        return toSurveyDetailResponse(survey, questions);
    }

    // 설문 통계 조회
    public SurveyStatsResponse getSurveyStats(Long adminId, Long surveyId) {
        validateAdmin(adminId);

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        long total = targetRepository.countBySurveyId(surveyId);
        long submitted = targetRepository.countBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED);

        double rate = (total == 0) ? 0.0 : (double) submitted / total * 100.0;
        rate = Math.round(rate * 100.0) / 100.0;

        Map<String, Long> byGrade = new HashMap<>();
        Map<String, Long> byDept = new HashMap<>();

        if (submitted > 0) {
            List<SurveyTarget> targets = targetRepository.findAllBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED);
            List<Long> accountIds = targets.stream().map(SurveyTarget::getTargetAccountId).toList();
            List<StudentProfile> profiles = studentProfileRepository.findAllById(accountIds);
            
            List<Long> deptIds = profiles.stream().map(StudentProfile::getDeptId).distinct().toList();
            List<Dept> depts = deptRepository.findAllById(deptIds);
            Map<Long, String> deptMap = depts.stream().collect(Collectors.toMap(Dept::getDeptId, Dept::getDeptName));

            for (StudentProfile p : profiles) {
                String gradeKey = p.getGradeLevel() + "학년";
                byGrade.put(gradeKey, byGrade.getOrDefault(gradeKey, 0L) + 1);

                String deptName = deptMap.getOrDefault(p.getDeptId(), "기타");
                byDept.put(deptName, byDept.getOrDefault(deptName, 0L) + 1);
            }
        }

        List<SurveyQuestion> questions = questionRepository.findBySurveyIdOrderBySortOrderAsc(surveyId);
        List<SurveyTarget> submittedTargets = (submitted > 0)
                ? targetRepository.findAllBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED)
                : Collections.emptyList();

        List<SurveyStatsResponse.QuestionStats> questionStatsList = new ArrayList<>();

        for (SurveyQuestion q : questions) {
            Map<String, Long> answerCounts = new HashMap<>();
            List<String> essayAnswers = new ArrayList<>();

            for (SurveyTarget t : submittedTargets) {
                Map<String, Object> responses = t.getResponseJson();
                if (responses == null) continue;

                Object answer = responses.get(String.valueOf(q.getId()));
                if (answer == null) continue;

                if (q.getQuestionType() == com.teamlms.backend.domain.survey.enums.SurveyQuestionType.ESSAY) {
                    essayAnswers.add(answer.toString());
                } else if (q.getQuestionType() == com.teamlms.backend.domain.survey.enums.SurveyQuestionType.MULTIPLE_CHOICE) {
                    if (answer instanceof List) {
                        List<?> selected = (List<?>) answer;
                        for (Object opt : selected) {
                            String key = opt.toString();
                            answerCounts.put(key, answerCounts.getOrDefault(key, 0L) + 1);
                        }
                    }
                } else {
                    String key = answer.toString();
                    answerCounts.put(key, answerCounts.getOrDefault(key, 0L) + 1);
                }
            }

            questionStatsList.add(SurveyStatsResponse.QuestionStats.builder()
                    .questionId(q.getId())
                    .title(q.getQuestionText())
                    .type(q.getQuestionType())
                    .answerCounts(answerCounts)
                    .essayAnswers(essayAnswers)
                    .build());
        }

        return SurveyStatsResponse.builder()
                .surveyId(surveyId)
                .title(survey.getTitle())
                .description(survey.getDescription())
                .startAt(survey.getStartAt())
                .endAt(survey.getEndAt())
                .totalTargets(total)
                .submittedCount(submitted)
                .responseRate(rate)
                .responseByGrade(byGrade)
                .responseByDept(byDept)
                .createdAt(survey.getCreatedAt())
                .questions(questionStatsList)
                .build();
    }

    public Page<SurveyParticipantResponse> getSurveyParticipants(Long adminId, Long surveyId, Pageable pageable) {
        validateAdmin(adminId);
        if (!surveyRepository.existsById(surveyId)) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }
        Page<SurveyTarget> targets = targetRepository.findBySurveyId(surveyId, pageable);
        return targets.map(target -> {
            Account user = accountRepository.findById(target.getTargetAccountId()).orElse(null);
            return SurveyParticipantResponse.builder()
                    .targetId(target.getId())
                    .accountId(target.getTargetAccountId())
                    .loginId(user != null ? user.getLoginId() : "Unknown")
                    .status(target.getStatus())
                    .submittedAt(target.getSubmittedAt())
                    .build();
        });
    }

    private void validateAdmin(Long adminId) {
        Account admin = accountRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        if (!"ADMIN".equals(admin.getAccountType().name())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
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
                .questionType(question.getQuestionType())
                .options(question.getOptions())
                .build();
    }
}