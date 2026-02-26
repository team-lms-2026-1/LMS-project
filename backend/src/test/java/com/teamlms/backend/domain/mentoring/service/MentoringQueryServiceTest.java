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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringChatMessageResponse;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringMatchingResponse;
import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentResponse;
import com.teamlms.backend.domain.mentoring.entity.MentoringAnswer;
import com.teamlms.backend.domain.mentoring.entity.MentoringApplication;
import com.teamlms.backend.domain.mentoring.entity.MentoringMatching;
import com.teamlms.backend.domain.mentoring.entity.MentoringQuestion;
import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import com.teamlms.backend.domain.mentoring.enums.MentoringMatchingStatus;
import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import com.teamlms.backend.domain.mentoring.repository.MentoringAnswerRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringApplicationRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringMatchingRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringQuestionRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringRecruitmentRepository;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;

@ExtendWith(MockitoExtension.class)
class MentoringQueryServiceTest {

    @InjectMocks
    private MentoringQueryService mentoringQueryService;

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
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private ProfessorProfileRepository professorProfileRepository;
    @Mock
    private DeptRepository deptRepository;
    @Mock
    private SemesterRepository semesterRepository;

    @Test
    @DisplayName("나의 매칭 내역 조회 - 정상 동작")
    void getMyMatchings_Success() {
        Long myAccountId = 1L;
        Long partnerAccountId = 2L;

        MentoringApplication myApp = MentoringApplication.builder().accountId(myAccountId).build();
        ReflectionTestUtils.setField(myApp, "applicationId", 10L);

        MentoringApplication partnerApp = MentoringApplication.builder().accountId(partnerAccountId).build();
        ReflectionTestUtils.setField(partnerApp, "applicationId", 20L);

        MentoringMatching matching = MentoringMatching.builder()
                .mentorApplicationId(20L).menteeApplicationId(10L).recruitmentId(100L)
                .status(MentoringMatchingStatus.ACTIVE).build();
        ReflectionTestUtils.setField(matching, "matchingId", 50L);

        Account partnerAcc = Account.builder().loginId("partnerId").accountType(AccountType.PROFESSOR).build();
        ReflectionTestUtils.setField(partnerAcc, "accountId", partnerAccountId);

        MentoringRecruitment recruitment = MentoringRecruitment.builder().title("24년 1학기 멘토링").build();
        ReflectionTestUtils.setField(recruitment, "recruitmentId", 100L);

        when(applicationRepository.findAllByAccountId(myAccountId)).thenReturn(List.of(myApp));
        when(matchingRepository.findAllByMentorApplicationIdInOrMenteeApplicationIdIn(List.of(10L), List.of(10L)))
                .thenReturn(List.of(matching));

        when(applicationRepository.findAllById(anyList())).thenReturn(List.of(myApp, partnerApp));
        when(accountRepository.findAllById(anyList())).thenReturn(List.of(partnerAcc));
        when(recruitmentRepository.findAllById(anyList())).thenReturn(List.of(recruitment));

        List<MentoringMatchingResponse> response = mentoringQueryService.getMyMatchings(myAccountId);

        assertEquals(1, response.size());
        assertEquals(50L, response.get(0).getMatchingId());
        assertEquals("MENTEE", response.get(0).getRole());
        assertEquals("24년 1학기 멘토링", response.get(0).getRecruitmentTitle());
    }

    @Test
    @DisplayName("채팅 이력 조회 성공 (1문 1답)")
    void getChatHistory_Success() {
        when(matchingRepository.existsById(1L)).thenReturn(true);

        MentoringQuestion q1 = MentoringQuestion.builder().matchingId(1L).content("Q1").build();
        ReflectionTestUtils.setField(q1, "questionId", 100L);
        ReflectionTestUtils.setField(q1, "createdBy", 10L); // student
        ReflectionTestUtils.setField(q1, "createdAt", LocalDateTime.now().minusDays(1));

        MentoringAnswer a1 = MentoringAnswer.builder().questionId(100L).content("A1").build();
        ReflectionTestUtils.setField(a1, "answerId", 200L);
        ReflectionTestUtils.setField(a1, "createdBy", 20L); // professor
        ReflectionTestUtils.setField(a1, "createdAt", LocalDateTime.now());

        when(questionRepository.findAllByMatchingId(1L)).thenReturn(List.of(q1));
        when(answerRepository.findAllByQuestionIdIn(List.of(100L))).thenReturn(List.of(a1));

        Account student = Account.builder().loginId("st_id").build();
        ReflectionTestUtils.setField(student, "accountId", 10L);
        Account prof = Account.builder().loginId("pr_id").build();
        ReflectionTestUtils.setField(prof, "accountId", 20L);

        when(accountRepository.findAllById(anyList())).thenReturn(List.of(student, prof));

        List<MentoringChatMessageResponse> chat = mentoringQueryService.getChatHistory(1L);

        assertEquals(2, chat.size());
        assertEquals("QUESTION", chat.get(0).getType());
        assertEquals("ANSWER", chat.get(1).getType());
    }

    @Test
    @DisplayName("모집 공고 전체 페이징 목록 조회")
    void getRecruitments_Success() {
        MentoringRecruitment recruitment = MentoringRecruitment.builder()
                .title("2024년 1학기 멘토링").status(MentoringRecruitmentStatus.OPEN).build();
        ReflectionTestUtils.setField(recruitment, "recruitmentId", 1L);
        ReflectionTestUtils.setField(recruitment, "semesterId", 10L);
        Page<MentoringRecruitment> page = new PageImpl<>(List.of(recruitment));

        when(recruitmentRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<MentoringRecruitmentResponse> response = mentoringQueryService.getRecruitments(
                PageRequest.of(0, 10), null, null, null);

        assertEquals(1, response.getTotalElements());
        assertEquals("2024년 1학기 멘토링", response.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("모집 공고 단건 조회")
    void getRecruitment_Success() {
        MentoringRecruitment recruitment = MentoringRecruitment.builder().title("공고1").semesterId(1L).build();
        when(recruitmentRepository.findById(1L)).thenReturn(Optional.of(recruitment));
        when(semesterRepository.findById(1L)).thenReturn(Optional.empty());

        MentoringRecruitmentResponse response = mentoringQueryService.getRecruitment(1L);

        assertEquals("공고1", response.getTitle());
    }

    @Test
    @DisplayName("모집 공고별 신청자 목록 조회")
    void getApplications_Success() {
        Long recruitmentId = 1L;
        MentoringApplication app = MentoringApplication.builder()
                .accountId(10L).role(com.teamlms.backend.domain.mentoring.enums.MentoringRole.MENTOR).build();
        ReflectionTestUtils.setField(app, "applicationId", 100L);

        when(applicationRepository.findAllByRecruitmentId(recruitmentId)).thenReturn(List.of(app));

        Account account = Account.builder().loginId("mentor01").accountType(AccountType.PROFESSOR).build();
        ReflectionTestUtils.setField(account, "accountId", 10L);
        when(accountRepository.findAllById(anyList())).thenReturn(List.of(account));

        List<com.teamlms.backend.domain.mentoring.api.dto.MentoringApplicationResponse> responses = mentoringQueryService
                .getApplications(recruitmentId);

        assertEquals(1, responses.size());
        assertEquals("mentor01", responses.get(0).getLoginId());
    }
}
