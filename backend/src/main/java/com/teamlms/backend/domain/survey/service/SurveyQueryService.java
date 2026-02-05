package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.survey.api.dto.*; // 외부 DTO
import com.teamlms.backend.domain.survey.dto.InternalSurveySearchRequest; // 내부 DTO
import com.teamlms.backend.domain.survey.entity.*;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import com.teamlms.backend.domain.survey.api.dto.SurveyParticipantResponse;
import com.teamlms.backend.domain.survey.api.dto.SurveyStatsResponse;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.jpa.domain.Specification;

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
    public Page<SurveyListResponse> getSurveyList(Long adminId, InternalSurveySearchRequest request,
            Pageable pageable) {
        Account admin = accountRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (!"ADMIN".equals(admin.getAccountType().name())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        Specification<Survey> spec = (root, query, cb) -> {
            if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
                return cb.like(root.get("title"), "%" + request.getKeyword() + "%");
            }
            return null;
        };

        Page<Survey> surveys = surveyRepository.findAll(spec, pageable);
        return surveys.map(this::toSurveyListResponse);
    }

    // 사용자 참여 가능 목록
    public List<SurveyListResponse> getAvailableSurveys(Long userId, String keyword) {

        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        // [추가] 교수는 설문 참여 불가
        if ("PROFESSOR".equals(user.getAccountType().name())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED); // "접근 권한이 없습니다."
        }

        // 학생은 본인이 Target에 있는지 확인 (기존 로직 활용)
        List<SurveyTarget> targets = targetRepository.findByTargetAccountIdAndStatus(userId,
                SurveyTargetStatus.PENDING);
        List<Long> surveyIds = targets.stream().map(SurveyTarget::getSurveyId).toList();

        if (surveyIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Survey> surveys;
        if (keyword != null && !keyword.trim().isEmpty()) {
            surveys = surveyRepository.findByIdInAndTitleContaining(surveyIds, keyword);
        } else {
            surveys = surveyRepository.findAllByIdInOrderByIdDesc(surveyIds);
        }

        return surveys.stream().map(this::toSurveyListResponse).collect(Collectors.toList());
    }

    // 상세 조회
    @Transactional
    public SurveyDetailResponse getSurveyDetail(Long surveyId, Long userId) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        String role = user.getAccountType().name();

        // 권한별 접근 제어
        if ("PROFESSOR".equals(role)) {
            // 교수는 접근 불가
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 설문 조회 (한 번만)
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        if ("STUDENT".equals(role)) {
            // 학생은 '자신이 대상자'인 경우에만 볼 수 있음
            boolean isTarget = targetRepository.findBySurveyIdAndTargetAccountId(surveyId, userId).isPresent();
            if (!isTarget) {
                throw new BusinessException(ErrorCode.SURVEY_NOT_TARGET); // "대상자가 아닙니다" 에러
            }

            // [추가] 설문 기간 체크
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if (now.isBefore(survey.getStartAt()) || now.isAfter(survey.getEndAt())) {
                throw new BusinessException(ErrorCode.SURVEY_NOT_OPEN); // "현재 진행 중인 설문이 아닙니다."
            }

            // [추가] 조회수 증가 (학생이 설문을 볼 때만)
            survey.increaseViewCount();
        }

        // 관리자는 검사 없이 통과 (Admin은 모든 설문 내용 볼 수 있음)

        List<SurveyQuestion> questions = questionRepository.findBySurveyIdOrderBySortOrderAsc(surveyId);

        return toSurveyDetailResponse(survey, questions);
    }

    // 설문 통계 조회 (응답률 + 학과/학년 통계)
    public SurveyStatsResponse getSurveyStats(Long adminId, Long surveyId) {
        // 관리자 권한 체크
        validateAdmin(adminId);

        // 설문 조회
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        long total = targetRepository.countBySurveyId(surveyId);
        long submitted = targetRepository.countBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED);

        // 0으로 나누기 방지
        double rate = (total == 0) ? 0.0 : (double) submitted / total * 100.0;
        // 소수점 둘째자리 반올림 (선택사항)
        rate = Math.round(rate * 100.0) / 100.0;

        // --- 통계 상세 데이터 집계 ---
        Map<String, Long> byGrade = new HashMap<>();
        Map<String, Long> byDept = new HashMap<>();

        if (submitted > 0) {
            // 1. 제출된 타겟 목록 로드
            List<SurveyTarget> targets = targetRepository.findAllBySurveyIdAndStatus(surveyId,
                    SurveyTargetStatus.SUBMITTED);
            List<Long> accountIds = targets.stream().map(SurveyTarget::getTargetAccountId).collect(Collectors.toList());

            // 2. 학생 프로필 조회
            List<StudentProfile> profiles = studentProfileRepository.findAllById(accountIds);

            // 3. 부서 정보 조회를 위한 ID 수집
            List<Long> deptIds = profiles.stream().map(StudentProfile::getDeptId).distinct()
                    .collect(Collectors.toList());
            List<Dept> depts = deptRepository.findAllById(deptIds);
            Map<Long, String> deptMap = depts.stream().collect(Collectors.toMap(Dept::getDeptId, Dept::getDeptName));

            // 4. 집계
            for (StudentProfile p : profiles) {
                // 학년 집계
                String gradeKey = p.getGradeLevel() + "학년";
                byGrade.put(gradeKey, byGrade.getOrDefault(gradeKey, 0L) + 1);

                // 학과 집계
                String deptName = deptMap.getOrDefault(p.getDeptId(), "기타");
                byDept.put(deptName, byDept.getOrDefault(deptName, 0L) + 1);
            }
        }

        // --- 문항별 통계 상세 집계 ---
        List<SurveyQuestion> questions = questionRepository.findBySurveyIdOrderBySortOrderAsc(surveyId);
        List<SurveyTarget> submittedTargets = (submitted > 0)
                ? targetRepository.findAllBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED)
                : new ArrayList<>();

        List<SurveyStatsResponse.QuestionStats> questionStatsList = new ArrayList<>();

        for (SurveyQuestion q : questions) {
            Map<String, Long> answerCounts = new HashMap<>();
            List<String> essayAnswers = new ArrayList<>();

            for (SurveyTarget t : submittedTargets) {
                Map<String, Object> responses = t.getResponseJson();
                if (responses == null)
                    continue;

                Object answer = responses.get(String.valueOf(q.getId()));
                if (answer == null)
                    continue;

                if (q.getQuestionType() == com.teamlms.backend.domain.survey.enums.SurveyQuestionType.ESSAY) {
                    essayAnswers.add(answer.toString());
                } else if (q
                        .getQuestionType() == com.teamlms.backend.domain.survey.enums.SurveyQuestionType.MULTIPLE_CHOICE) {
                    if (answer instanceof List) {
                        List<?> selected = (List<?>) answer;
                        for (Object opt : selected) {
                            String key = opt.toString();
                            answerCounts.put(key, answerCounts.getOrDefault(key, 0L) + 1);
                        }
                    }
                } else {
                    // RATING, SINGLE_CHOICE
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

    // 설문 참여자 목록 조회 (실시간 현황)
    public Page<SurveyParticipantResponse> getSurveyParticipants(Long adminId, Long surveyId, Pageable pageable) {
        // 관리자 권한 체크
        validateAdmin(adminId);

        if (!surveyRepository.existsById(surveyId)) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }

        // 대상자 목록 조회
        Page<SurveyTarget> targets = targetRepository.findBySurveyId(surveyId, pageable);

        return targets.map(target -> {
            Account user = accountRepository.findById(target.getTargetAccountId())
                    .orElse(null);

            return SurveyParticipantResponse.builder()
                    .targetId(target.getId())
                    .accountId(target.getTargetAccountId())
                    .loginId(user != null ? user.getLoginId() : "Unknown")
                    .status(target.getStatus())
                    .submittedAt(target.getSubmittedAt())
                    .build();
        });
    }

    // [내부 헬퍼] 관리자 체크
    private void validateAdmin(Long adminId) {
        Account admin = accountRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        if (!"ADMIN".equals(admin.getAccountType().name())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }

    // --- Mappers ---
    private SurveyListResponse toSurveyListResponse(Survey survey) {
        // 현재 시간 기준으로 상태 계산
        LocalDateTime now = LocalDateTime.now();
        SurveyStatus displayStatus = survey.getStatus();

        // 설문 기간이 아니면 CLOSED로 표시
        if (now.isBefore(survey.getStartAt()) || now.isAfter(survey.getEndAt())) {
            displayStatus = SurveyStatus.CLOSED;
        }

        return SurveyListResponse.builder()
                .surveyId(survey.getId())
                .type(survey.getType())
                .title(survey.getTitle())
                .status(displayStatus)
                .startAt(survey.getStartAt())
                .endAt(survey.getEndAt())
                .viewCount(survey.getViewCount())
                .createdAt(survey.getCreatedAt())
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

                .questions(questions.stream().map(q -> toQuestionResponse(q)).collect(Collectors.toList()))
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
                // [New]
                .questionType(question.getQuestionType())
                .options(question.getOptions())
                .build();
    }
}