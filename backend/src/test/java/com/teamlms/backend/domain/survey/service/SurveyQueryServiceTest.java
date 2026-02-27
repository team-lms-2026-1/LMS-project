package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.survey.api.dto.*;
import com.teamlms.backend.domain.survey.entity.Survey;
import com.teamlms.backend.domain.survey.entity.SurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.repository.SurveyQuestionRepository;
import com.teamlms.backend.domain.survey.repository.SurveyRepository;
import com.teamlms.backend.domain.survey.repository.SurveyTargetRepository;
import com.teamlms.backend.domain.survey.repository.SurveyTypeConfigRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SurveyQueryServiceTest {

    @InjectMocks
    private SurveyQueryService surveyQueryService;

    @Mock
    private SurveyRepository surveyRepository;
    @Mock
    private SurveyQuestionRepository questionRepository;
    @Mock
    private SurveyTargetRepository targetRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private DeptRepository deptRepository;
    @Mock
    private SurveyTypeConfigRepository typeConfigRepository;

    @Test
    @DisplayName("관리자 설문 목록 조회")
    void getSurveyList_Success() {
        // given
        InternalSurveySearchRequest request = new InternalSurveySearchRequest(null, null, null);
        Survey survey = Survey.builder().title("제목").build();
        ReflectionTestUtils.setField(survey, "surveyId", 1L);
        Page<SurveyListResponse> page = new PageImpl<>(
                List.of(SurveyListResponse.builder().surveyId(1L).title("제목").build()));

        when(surveyRepository.findSurveyAdminList(any(), any(), any(), any())).thenReturn(page);

        // when
        Page<SurveyListResponse> result = surveyQueryService.getSurveyList(request, PageRequest.of(0, 10));

        // then
        assertEquals(1, result.getTotalElements());
        assertEquals("제목", result.getContent().get(0).title());
    }

    @Test
    @DisplayName("상세 조회 성공 - 학생")
    void getSurveyDetail_Success_Student() {
        // given
        Long surveyId = 1L;
        Long userId = 10L;
        Account student = Account.builder().accountType(AccountType.STUDENT).build();
        Survey survey = Survey.builder()
                .title("제목")
                .startAt(LocalDateTime.now().minusDays(1))
                .endAt(LocalDateTime.now().plusDays(1))
                .status(SurveyStatus.OPEN)
                .build();
        ReflectionTestUtils.setField(survey, "surveyId", surveyId);

        when(accountRepository.findById(userId)).thenReturn(Optional.of(student));
        when(surveyRepository.findById(surveyId)).thenReturn(Optional.of(survey));
        when(targetRepository.findBySurveyIdAndTargetAccountId(surveyId, userId))
                .thenReturn(Optional.of(SurveyTarget.builder().build()));
        when(questionRepository.findBySurveyIdOrderBySortOrderAsc(surveyId)).thenReturn(Collections.emptyList());

        // when
        SurveyDetailResponse response = surveyQueryService.getSurveyDetail(surveyId, userId);

        // then
        assertEquals("제목", response.title());
        assertTrue(survey.getViewCount() > 0);
    }

    @Test
    @DisplayName("상세 조회 실패 - 대상자가 아님")
    void getSurveyDetail_Fail_NotTarget() {
        // given
        Long surveyId = 1L;
        Long userId = 10L;
        Account student = Account.builder().accountType(AccountType.STUDENT).build();
        Survey survey = Survey.builder().build();

        when(accountRepository.findById(userId)).thenReturn(Optional.of(student));
        when(surveyRepository.findById(surveyId)).thenReturn(Optional.of(survey));
        when(targetRepository.findBySurveyIdAndTargetAccountId(surveyId, userId)).thenReturn(Optional.empty());

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> surveyQueryService.getSurveyDetail(surveyId, userId));
        assertEquals(ErrorCode.SURVEY_NOT_TARGET, ex.getErrorCode());
    }

    @Test
    @DisplayName("설문 통계 조회")
    void getSurveyStats_Success() {
        // given
        Long surveyId = 1L;
        Survey survey = Survey.builder().title("제목").build();
        ReflectionTestUtils.setField(survey, "surveyId", surveyId);

        when(surveyRepository.findById(surveyId)).thenReturn(Optional.of(survey));
        when(targetRepository.countBySurveyId(surveyId)).thenReturn(10L);
        when(targetRepository.countBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED)).thenReturn(5L);
        when(questionRepository.findBySurveyIdOrderBySortOrderAsc(surveyId)).thenReturn(Collections.emptyList());

        // when
        SurveyStatsResponse response = surveyQueryService.getSurveyStats(surveyId);

        // then
        assertEquals(50.0, response.responseRate());
        assertEquals(10, response.totalTargets());
    }
}
