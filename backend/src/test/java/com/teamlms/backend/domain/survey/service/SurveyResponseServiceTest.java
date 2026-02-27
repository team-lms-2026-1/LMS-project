package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.survey.api.dto.SurveySubmitRequest;
import com.teamlms.backend.domain.survey.entity.Survey;
import com.teamlms.backend.domain.survey.entity.SurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.repository.SurveyRepository;
import com.teamlms.backend.domain.survey.repository.SurveyTargetRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SurveyResponseServiceTest {

    @InjectMocks
    private SurveyResponseService surveyResponseService;

    @Mock
    private SurveyTargetRepository targetRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private SurveyRepository surveyRepository;

    @Test
    @DisplayName("응답 제출 성공")
    void submitResponse_Success() {
        // given
        Long userId = 10L;
        Long surveyId = 1L;
        SurveySubmitRequest request = new SurveySubmitRequest(surveyId, Map.of("1", "답변"));

        Account student = Account.builder().accountType(AccountType.STUDENT).build();
        Survey survey = Survey.builder()
                .startAt(LocalDateTime.now().minusDays(1))
                .endAt(LocalDateTime.now().plusDays(1))
                .build();
        SurveyTarget target = SurveyTarget.builder().build();

        when(accountRepository.findById(userId)).thenReturn(Optional.of(student));
        when(targetRepository.findBySurveyIdAndTargetAccountId(surveyId, userId)).thenReturn(Optional.of(target));
        when(surveyRepository.findById(surveyId)).thenReturn(Optional.of(survey));

        // when
        surveyResponseService.submitResponse(userId, request);

        // then
        assertEquals(SurveyTargetStatus.SUBMITTED, target.getStatus());
        assertNotNull(target.getSubmittedAt());
    }

    @Test
    @DisplayName("응답 제출 실패 - 교수는 설문 불가")
    void submitResponse_Fail_ProfessorNotAllowed() {
        // given
        Long userId = 20L;
        Account professor = Account.builder().accountType(AccountType.PROFESSOR).build();
        when(accountRepository.findById(userId)).thenReturn(Optional.of(professor));

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> surveyResponseService.submitResponse(userId,
                        new SurveySubmitRequest(1L, Collections.emptyMap())));
        assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
    }

    @Test
    @DisplayName("응답 제출 실패 - 기간 종료")
    void submitResponse_Fail_Expired() {
        // given
        Long userId = 10L;
        Long surveyId = 1L;
        Account student = Account.builder().accountType(AccountType.STUDENT).build();
        Survey survey = Survey.builder()
                .startAt(LocalDateTime.now().minusDays(7))
                .endAt(LocalDateTime.now().minusDays(1)) // 어제 종료
                .build();
        SurveyTarget target = SurveyTarget.builder().build();

        when(accountRepository.findById(userId)).thenReturn(Optional.of(student));
        when(targetRepository.findBySurveyIdAndTargetAccountId(surveyId, userId)).thenReturn(Optional.of(target));
        when(surveyRepository.findById(surveyId)).thenReturn(Optional.of(survey));

        // when & then
        BusinessException ex = assertThrows(BusinessException.class,
                () -> surveyResponseService.submitResponse(userId, new SurveySubmitRequest(surveyId, Map.of())));
        assertEquals(ErrorCode.SURVEY_NOT_OPEN, ex.getErrorCode());
    }
}
