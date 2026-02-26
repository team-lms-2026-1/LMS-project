package com.teamlms.backend.domain.mbti.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.mbti.api.dto.MbtiQuestionResponse;
import com.teamlms.backend.domain.mbti.api.dto.MbtiResultResponse;
import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import com.teamlms.backend.domain.mbti.repository.MbtiQuestionRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiResultRepository;

@ExtendWith(MockitoExtension.class)
class MbtiQueryServiceTest {

    @InjectMocks
    private MbtiQueryService mbtiQueryService;

    @Mock
    private MbtiQuestionRepository questionRepository;

    @Mock
    private MbtiResultRepository resultRepository;

    @Test
    @DisplayName("MBTI 질문 전체 조회")
    void getAllQuestions_Success() {
        MbtiQuestion q1 = MbtiQuestion.builder().content("질문1").sortOrder(1).build();
        ReflectionTestUtils.setField(q1, "questionId", 1L);

        MbtiQuestion q2 = MbtiQuestion.builder().content("질문2").sortOrder(2).build();
        ReflectionTestUtils.setField(q2, "questionId", 2L);

        when(questionRepository.findAllOrderBySortOrder()).thenReturn(List.of(q1, q2));

        List<MbtiQuestionResponse> result = mbtiQueryService.getAllQuestions();

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).questionId());
    }

    @Test
    @DisplayName("최근 MBTI 결과 상세 조회 - 존재함")
    void getLatestResult_Success() {
        Long accountId = 100L;
        MbtiResult mbtiResult = MbtiResult.builder()
                .accountId(accountId).mbtiType("INTJ").build();
        ReflectionTestUtils.setField(mbtiResult, "resultId", 200L);

        when(resultRepository.findTopByAccountIdOrderByCreatedAtDesc(accountId))
                .thenReturn(Optional.of(mbtiResult));

        MbtiResultResponse response = mbtiQueryService.getLatestResult(accountId);

        assertNotNull(response);
        assertEquals("INTJ", response.mbtiType());
        assertEquals(200L, response.resultId());
    }

    @Test
    @DisplayName("최근 MBTI 결과 상세 조회 - 존재하지 않음")
    void getLatestResult_Null() {
        Long accountId = 100L;
        when(resultRepository.findTopByAccountIdOrderByCreatedAtDesc(accountId))
                .thenReturn(Optional.empty());

        MbtiResultResponse response = mbtiQueryService.getLatestResult(accountId);

        assertNull(response);
    }
}
