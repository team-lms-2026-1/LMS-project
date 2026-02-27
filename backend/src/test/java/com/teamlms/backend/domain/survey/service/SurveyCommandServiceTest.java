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
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SurveyCommandServiceTest {

        @InjectMocks
        private SurveyCommandService surveyCommandService;

        @Mock
        private SurveyRepository surveyRepository;
        @Mock
        private SurveyQuestionRepository questionRepository;
        @Mock
        private SurveyTargetRepository targetRepository;
        @Mock
        private AccountRepository accountRepository;
        @Mock
        private AlarmCommandService alarmCommandService;
        @Mock
        private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

        @Test
        @DisplayName("설문 생성 및 배포 성공 (전체 학생 대상)")
        void createAndPublishSurvey_Success_AllStudents() {
                // given
                LocalDateTime start = LocalDateTime.now().plusDays(1);
                LocalDateTime end = start.plusDays(7);
                SurveyQuestionDto qDto = new SurveyQuestionDto("질문1", 1, 1, 5, "매우나쁨", "매우좋음", true,
                                SurveyQuestionType.RATING,
                                null);
                SurveyCreateRequest request = new SurveyCreateRequest(
                                SurveyType.SATISFACTION, "설문 제목", "설문 설명", start, end, List.of(qDto),
                                new SurveyTargetFilterDto(SurveyTargetGenType.ALL, null, null, null));

                Survey survey = Survey.builder().build();
                ReflectionTestUtils.setField(survey, "surveyId", 1L);
                when(surveyRepository.save(any(Survey.class))).thenReturn(survey);

                Account student = Account.builder().build();
                ReflectionTestUtils.setField(student, "accountId", 10L);
                when(accountRepository.findAllByAccountType(AccountType.STUDENT)).thenReturn(List.of(student));

                try {
                        lenient().when(objectMapper.writeValueAsString(any())).thenReturn("{\"genType\":\"ALL\"}");
                } catch (Exception e) {
                }

                // when
                surveyCommandService.createAndPublishSurvey(999L, request);

                // then
                verify(surveyRepository).save(any(Survey.class));
                verify(questionRepository).saveAll(anyList());
                verify(targetRepository).saveAll(anyList());
        }

        @Test
        @DisplayName("설문 생성 실패 - 잘못된 날짜 범위")
        void createAndPublishSurvey_Fail_InvalidDate() {
                // given
                LocalDateTime start = LocalDateTime.now().plusDays(7);
                LocalDateTime end = start.minusDays(1); // 종료일이 시작일보다 빠름
                SurveyCreateRequest request = new SurveyCreateRequest(
                                SurveyType.SATISFACTION, "제목", "설명", start, end,
                                List.of(new SurveyQuestionDto("Q", 1, 1, 5, "", "", true, SurveyQuestionType.RATING,
                                                null)),
                                null);

                // when & then
                BusinessException ex = assertThrows(BusinessException.class,
                                () -> surveyCommandService.createAndPublishSurvey(1L, request));
                assertEquals(ErrorCode.SURVEY_DATE_INVALID, ex.getErrorCode());
        }

        @Test
        @DisplayName("설문 수정 성공 (응답이 없을 때)")
        void patchSurvey_Success() {
                // given
                Long surveyId = 1L;
                LocalDateTime start = LocalDateTime.now().plusDays(1);
                LocalDateTime end = start.plusDays(7);
                SurveyPatchRequest request = new SurveyPatchRequest(
                                SurveyType.SATISFACTION, "수정 제목", "수정 설명", start, end,
                                List.of(new SurveyQuestionDto("새 질문", 1, 1, 5, "", "", true, SurveyQuestionType.RATING,
                                                null)));

                Survey survey = Survey.builder().build();
                ReflectionTestUtils.setField(survey, "surveyId", surveyId);

                when(surveyRepository.findById(surveyId)).thenReturn(Optional.of(survey));
                when(targetRepository.countBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED)).thenReturn(0L);

                // when
                surveyCommandService.patchSurvey(surveyId, request);

                // then
                verify(questionRepository).deleteAllBySurveyId(surveyId);
                verify(questionRepository).saveAll(anyList());
        }

        @Test
        @DisplayName("설문 수정 실패 - 응답이 이미 존재하는 경우")
        void patchSurvey_Fail_HasResponses() {
                // given
                Long surveyId = 1L;
                SurveyPatchRequest request = new SurveyPatchRequest(
                                SurveyType.SATISFACTION, "제목", "설정", LocalDateTime.now(),
                                LocalDateTime.now().plusDays(1),
                                List.of(new SurveyQuestionDto("Q", 1, 1, 5, "", "", true, SurveyQuestionType.RATING,
                                                null)));

                Survey survey = Survey.builder().build();
                when(surveyRepository.findById(surveyId)).thenReturn(Optional.of(survey));
                when(targetRepository.countBySurveyIdAndStatus(surveyId, SurveyTargetStatus.SUBMITTED)).thenReturn(1L);

                // when & then
                BusinessException ex = assertThrows(BusinessException.class,
                                () -> surveyCommandService.patchSurvey(surveyId, request));
                assertEquals(ErrorCode.SURVEY_HAS_RESPONSES, ex.getErrorCode());
        }

        @Test
        @DisplayName("설문 삭제 성공")
        void deleteSurvey_Success() {
                // given
                Long surveyId = 1L;
                Survey survey = Survey.builder().build();
                when(surveyRepository.findById(surveyId)).thenReturn(Optional.of(survey));

                // when
                surveyCommandService.deleteSurvey(surveyId);

                // then
                verify(targetRepository).deleteAllBySurveyId(surveyId);
                verify(questionRepository).deleteAllBySurveyId(surveyId);
                verify(surveyRepository).delete(survey);
        }
}
