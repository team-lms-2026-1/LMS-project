package com.teamlms.backend.domain.mentoring.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringAnswerRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringApplicationRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringMatchingRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringQuestionRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentCreateRequest;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringStatusUpdateRequest;
import com.teamlms.backend.domain.mentoring.entity.MentoringAnswer;
import com.teamlms.backend.domain.mentoring.entity.MentoringApplication;
import com.teamlms.backend.domain.mentoring.entity.MentoringMatching;
import com.teamlms.backend.domain.mentoring.entity.MentoringQuestion;
import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import com.teamlms.backend.domain.mentoring.enums.MentoringApplicationStatus;
import com.teamlms.backend.domain.mentoring.enums.MentoringRole;
import com.teamlms.backend.domain.mentoring.repository.MentoringAnswerRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringApplicationRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringMatchingRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringQuestionRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringRecruitmentRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class MentoringCommandServiceTest {

    @InjectMocks
    private MentoringCommandService mentoringCommandService;

    @Mock
    private MentoringRecruitmentRepository recruitmentRepository;

    @Mock
    private MentoringApplicationRepository applicationRepository;

    @Mock
    private MentoringMatchingRepository matchingRepository;

    @Mock
    private MentoringQuestionRepository questionRepository;

    @Mock
    private MentoringAnswerRepository answerRepository;

    @Mock
    private AccountRepository accountRepository;

    @Test
    @DisplayName("멘토링 모집 공고 생성")
    void createRecruitment_Success() {
        MentoringRecruitmentCreateRequest request = new MentoringRecruitmentCreateRequest(
                1L, "24-1 멘토링", "설명",
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(7));

        MentoringRecruitment recruitment = MentoringRecruitment.builder().build();
        ReflectionTestUtils.setField(recruitment, "recruitmentId", 100L);

        when(recruitmentRepository.save(any(MentoringRecruitment.class))).thenReturn(recruitment);

        Long savedId = mentoringCommandService.createRecruitment(request);

        assertEquals(100L, savedId);
        verify(recruitmentRepository, times(1)).save(any(MentoringRecruitment.class));
    }

    @Test
    @DisplayName("멘토링 신청 성공 - 멘티")
    void applyMentoring_Mentee_Success() {
        MentoringApplicationRequest request = new MentoringApplicationRequest(
                100L, MentoringRole.MENTEE, "배우고 싶습니다");

        Account account = Account.builder().accountType(AccountType.STUDENT).build();
        ReflectionTestUtils.setField(account, "accountId", 1L);

        MentoringRecruitment recruitment = MentoringRecruitment.builder()
                .recruitStartAt(LocalDateTime.now().minusDays(1))
                .recruitEndAt(LocalDateTime.now().plusDays(7))
                .build();

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(recruitmentRepository.findById(100L)).thenReturn(Optional.of(recruitment));
        when(applicationRepository.existsByRecruitmentIdAndAccountIdAndRole(100L, 1L, MentoringRole.MENTEE))
                .thenReturn(false);

        mentoringCommandService.applyMentoring(1L, request);

        verify(applicationRepository, times(1)).save(any(MentoringApplication.class));
    }

    @Test
    @DisplayName("멘토링 신청 실패 - 교수 권한으로 멘티 신청 불가")
    void applyMentoring_Fail_InvalidRole() {
        MentoringApplicationRequest request = new MentoringApplicationRequest(
                100L, MentoringRole.MENTEE, "배우고 싶습니다");

        Account account = Account.builder().accountType(AccountType.PROFESSOR).build(); // Professor trying to be mentee
        ReflectionTestUtils.setField(account, "accountId", 1L);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        assertThrows(BusinessException.class, () -> mentoringCommandService.applyMentoring(1L, request));
    }

    @Test
    @DisplayName("관리자 수동 매칭 - 성공")
    void match_Success() {
        Long adminId = 999L;
        MentoringMatchingRequest request = new MentoringMatchingRequest(100L, 10L, List.of(20L, 21L));

        MentoringApplication mentorApp = MentoringApplication.builder().status(MentoringApplicationStatus.APPROVED)
                .build();
        MentoringApplication menteeApp1 = MentoringApplication.builder().status(MentoringApplicationStatus.APPROVED)
                .build();
        MentoringApplication menteeApp2 = MentoringApplication.builder().status(MentoringApplicationStatus.APPROVED)
                .build();

        when(applicationRepository.findById(10L)).thenReturn(Optional.of(mentorApp));
        when(applicationRepository.findById(20L)).thenReturn(Optional.of(menteeApp1));
        when(applicationRepository.findById(21L)).thenReturn(Optional.of(menteeApp2));

        mentoringCommandService.match(adminId, request);

        verify(matchingRepository, times(1)).saveAll(anyList());
        assertEquals(MentoringApplicationStatus.MATCHED, mentorApp.getStatus());
        assertEquals(MentoringApplicationStatus.MATCHED, menteeApp1.getStatus());
    }

    @Test
    @DisplayName("상태 업데이트 실패 - 거절시 사유 필요")
    void updateApplicationStatus_Fail_RejectReasonRequired() {
        MentoringStatusUpdateRequest request = new MentoringStatusUpdateRequest(
                MentoringApplicationStatus.REJECTED, "" // Blank reason
        );

        MentoringApplication app = MentoringApplication.builder().build();
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(BusinessException.class, () -> mentoringCommandService.updateApplicationStatus(999L, 1L, request));
    }

    @Test
    @DisplayName("질문 등록 성공")
    void createQuestion_Success() {
        Long writerId = 10L;
        MentoringQuestionRequest request = new MentoringQuestionRequest(100L, "안녕하세요 질문있습니다");

        MentoringMatching matching = MentoringMatching.builder()
                .menteeApplicationId(1L).mentorApplicationId(2L).build();

        MentoringApplication menteeApp = MentoringApplication.builder().accountId(writerId).build();
        MentoringApplication mentorApp = MentoringApplication.builder().accountId(20L).build();

        when(matchingRepository.findById(100L)).thenReturn(Optional.of(matching));
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(menteeApp));
        when(applicationRepository.findById(2L)).thenReturn(Optional.of(mentorApp));

        mentoringCommandService.createQuestion(writerId, request);

        verify(questionRepository, times(1)).save(any(MentoringQuestion.class));
    }

    @Test
    @DisplayName("답변 등록 성공")
    void createAnswer_Success() {
        Long writerId = 20L;
        MentoringAnswerRequest request = new MentoringAnswerRequest(1000L, "답변드립니다");

        MentoringQuestion question = MentoringQuestion.builder().matchingId(100L).build();
        ReflectionTestUtils.setField(question, "questionId", 1000L);

        MentoringMatching matching = MentoringMatching.builder().mentorApplicationId(2L).build();
        MentoringApplication mentorApp = MentoringApplication.builder().accountId(writerId).build();

        when(questionRepository.findById(1000L)).thenReturn(Optional.of(question));
        when(matchingRepository.findById(100L)).thenReturn(Optional.of(matching));
        when(applicationRepository.findById(2L)).thenReturn(Optional.of(mentorApp));

        mentoringCommandService.createAnswer(writerId, request);

        verify(answerRepository, times(1)).save(any(MentoringAnswer.class));
    }

    @Test
    @DisplayName("모집 공고 삭제 - 연관 데이터 포함")
    void deleteRecruitment_WithRelatedData_Success() {
        Long recruitmentId = 1L;
        MentoringRecruitment recruitment = MentoringRecruitment.builder().build();

        when(recruitmentRepository.findById(recruitmentId)).thenReturn(Optional.of(recruitment));

        MentoringMatching matching = MentoringMatching.builder().build();
        ReflectionTestUtils.setField(matching, "matchingId", 10L);
        when(matchingRepository.findAllByRecruitmentId(recruitmentId)).thenReturn(List.of(matching));

        MentoringQuestion question = MentoringQuestion.builder().build();
        ReflectionTestUtils.setField(question, "questionId", 100L);
        when(questionRepository.findAllByMatchingIdIn(anyList())).thenReturn(List.of(question));

        mentoringCommandService.deleteRecruitment(recruitmentId);

        verify(answerRepository).deleteAllByQuestionIdIn(anyList());
        verify(questionRepository).deleteAll(anyList());
        verify(matchingRepository).deleteAll(anyList());
        verify(applicationRepository).deleteAllByRecruitmentId(recruitmentId);
        verify(recruitmentRepository).delete(recruitment);
    }
}
