package com.teamlms.backend.domain.community.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
import com.teamlms.backend.domain.community.api.dto.ExternalAnswerRequest;
import com.teamlms.backend.domain.community.api.dto.ExternalQnaRequest;
import com.teamlms.backend.domain.community.entity.QnaAnswer;
import com.teamlms.backend.domain.community.entity.QnaCategory;
import com.teamlms.backend.domain.community.entity.QnaQuestion;
import com.teamlms.backend.domain.community.repository.QnaAnswerRepository;
import com.teamlms.backend.domain.community.repository.QnaCategoryRepository;
import com.teamlms.backend.domain.community.repository.QnaQuestionRepository;
import com.teamlms.backend.domain.community.repository.CommunityAccountRepository;
import com.teamlms.backend.domain.alarm.service.AlarmCommandService;

@ExtendWith(MockitoExtension.class)
class QnaServiceTest {

    @InjectMocks
    private QnaService qnaService;

    @Mock
    private QnaQuestionRepository questionRepository;

    @Mock
    private QnaAnswerRepository answerRepository;

    @Mock
    private QnaCategoryRepository categoryRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CommunityAccountRepository communityAccountRepository;

    @Mock
    private AlarmCommandService alarmCommandService;

    @Test
    @DisplayName("QnA 생성 성공")
    void createQuestion_Success() {
        // given
        Long authorId = 1L;
        Long categoryId = 1L;

        Account author = mock(Account.class);
        when(accountRepository.findById(authorId)).thenReturn(Optional.of(author));

        QnaCategory category = mock(QnaCategory.class);
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        ExternalQnaRequest request = new ExternalQnaRequest();
        ReflectionTestUtils.setField(request, "categoryId", categoryId);
        ReflectionTestUtils.setField(request, "title", "Question Title");
        ReflectionTestUtils.setField(request, "content", "Question Content");

        when(questionRepository.save(any(QnaQuestion.class))).thenAnswer(invocation -> {
            QnaQuestion question = invocation.getArgument(0);
            ReflectionTestUtils.setField(question, "id", 300L);
            return question;
        });

        // when
        Long questionId = qnaService.createQuestion(request, authorId);

        // then
        verify(accountRepository).findById(authorId);
        verify(categoryRepository).findById(categoryId);
        verify(questionRepository).save(any(QnaQuestion.class));
        assertNotNull(questionId);
        assertEquals(300L, questionId);
    }

    @Test
    @DisplayName("QnA 질문 삭제 성공")
    void deleteQuestion_Success() {
        // given
        Long questionId = 1L;
        Long userId = 1L;

        Account author = mock(Account.class);
        when(author.getAccountId()).thenReturn(userId);

        QnaQuestion question = mock(QnaQuestion.class);
        when(question.getAuthor()).thenReturn(author);
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        Account requestUser = mock(Account.class);
        when(requestUser.getAccountType()).thenReturn(AccountType.STUDENT);
        when(accountRepository.findById(userId)).thenReturn(Optional.of(requestUser));

        // when
        qnaService.deleteQuestion(questionId, userId);

        // then
        verify(questionRepository).delete(question);
    }

    @Test
    @DisplayName("QnA 답변 생성 성공")
    void createAnswer_Success() {
        // given
        Long questionId = 1L;
        Long adminId = 1L;

        QnaQuestion question = mock(QnaQuestion.class);
        when(question.getAnswer()).thenReturn(null);
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        Account questionAuthor = mock(Account.class);
        when(questionAuthor.getAccountId()).thenReturn(2L);
        when(question.getAuthor()).thenReturn(questionAuthor);

        Account admin = mock(Account.class);
        when(accountRepository.findById(adminId)).thenReturn(Optional.of(admin));

        ExternalAnswerRequest request = new ExternalAnswerRequest();
        ReflectionTestUtils.setField(request, "content", "Answer Content");

        // when
        qnaService.createAnswer(questionId, request, adminId);

        // then
        verify(answerRepository).save(any(QnaAnswer.class));
    }
}
