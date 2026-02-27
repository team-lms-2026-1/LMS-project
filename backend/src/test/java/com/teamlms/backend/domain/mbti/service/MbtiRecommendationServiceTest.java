package com.teamlms.backend.domain.mbti.service;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamlms.backend.domain.mbti.api.dto.MbtiJobRecommendationResponse;
import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.entity.JobCatalog;
import com.teamlms.backend.domain.mbti.entity.MbtiJobRecommendation;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import com.teamlms.backend.domain.mbti.repository.JobCatalogRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiJobRecommendationRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiResultRepository;

@ExtendWith(MockitoExtension.class)
class MbtiRecommendationServiceTest {

    @InjectMocks
    private MbtiRecommendationService recommendationService;

    @Mock
    private MbtiResultRepository mbtiResultRepository;

    @Mock
    private MbtiJobRecommendationRepository recommendationRepository;

    @Mock
    private MbtiRecommendationKeywordService keywordService;

    @Mock
    private MbtiRecommendationCandidateSelector candidateSelector;

    @Mock
    private MbtiRecommendationAiClient aiClient;

    @Mock
    private JobCatalogRepository jobCatalogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("추천 키워드 목록 반환 작동 확인")
    void getActiveInterestKeywords_Success() {
        when(keywordService.getActiveInterestKeywords()).thenReturn(List.of());
        assertNotNull(recommendationService.getActiveInterestKeywords());
    }

    @Test
    @DisplayName("MBTI 및 직업 추천 생성 - AI 클라이언트 미지원에 의한 Fallback 템플릿 반환 검사")
    void generateRecommendation_FallbackSuccess() {
        Long accountId = 100L;
        String locale = "ko";

        MbtiResult mbtiResult = MbtiResult.builder().mbtiType("ENFJ").build();
        ReflectionTestUtils.setField(mbtiResult, "resultId", 1L);
        when(mbtiResultRepository.findTopByAccountIdOrderByCreatedAtDesc(accountId))
                .thenReturn(Optional.of(mbtiResult));

        InterestKeywordMaster keyword = InterestKeywordMaster.builder()
                .keyword("코딩")
                .build();
        ReflectionTestUtils.setField(keyword, "id", 10L);
        when(keywordService.getValidatedKeywords(any())).thenReturn(List.of(keyword));

        JobCatalog job1 = JobCatalog.builder().jobCode("J01").jobName("백엔드").build();
        JobCatalog job2 = JobCatalog.builder().jobCode("J02").jobName("프론트").build();
        JobCatalog job3 = JobCatalog.builder().jobCode("J03").jobName("DBA").build();
        JobCatalog job4 = JobCatalog.builder().jobCode("J04").jobName("데브옵스").build();
        JobCatalog job5 = JobCatalog.builder().jobCode("J05").jobName("보안").build();
        ReflectionTestUtils.setField(job1, "id", 101L);
        ReflectionTestUtils.setField(job2, "id", 102L);
        ReflectionTestUtils.setField(job3, "id", 103L);
        ReflectionTestUtils.setField(job4, "id", 104L);
        ReflectionTestUtils.setField(job5, "id", 105L);

        MbtiRecommendationCandidate can1 = new MbtiRecommendationCandidate(job1, 100, List.of("코딩"));
        MbtiRecommendationCandidate can2 = new MbtiRecommendationCandidate(job2, 90, List.of("코딩"));
        MbtiRecommendationCandidate can3 = new MbtiRecommendationCandidate(job3, 80, List.of("코딩"));
        MbtiRecommendationCandidate can4 = new MbtiRecommendationCandidate(job4, 70, List.of("코딩"));
        MbtiRecommendationCandidate can5 = new MbtiRecommendationCandidate(job5, 60, List.of("코딩"));

        List<MbtiRecommendationCandidate> candidates = List.of(can1, can2, can3, can4, can5);
        when(candidateSelector.selectCandidates(any())).thenReturn(candidates);

        when(aiClient.isAvailable()).thenReturn(false);

        MbtiJobRecommendation recommendation = MbtiJobRecommendation.create(
                accountId, mbtiResult, List.of(10L), List.of("J01"), "fallback-model", "test-version",
                LocalDateTime.now());
        ReflectionTestUtils.setField(recommendation, "recommendationId", 500L);
        when(recommendationRepository.findByAccountId(accountId)).thenReturn(Optional.empty());
        when(recommendationRepository.save(any(MbtiJobRecommendation.class))).thenReturn(recommendation);

        when(jobCatalogRepository.findAllById(any())).thenReturn(List.of(job1));

        // When
        MbtiJobRecommendationResponse response = recommendationService.generateRecommendation(accountId, List.of(10L),
                locale);

        // Then
        assertNotNull(response);
        verify(recommendationRepository, times(1)).save(any(MbtiJobRecommendation.class));
    }

    @Test
    @DisplayName("생성된 추천 정보 단건 조회 성공")
    void getLatestRecommendation_Success() {
        Long accountId = 1L;
        MbtiJobRecommendation recommendation = MbtiJobRecommendation.create(
                1L, MbtiResult.builder().build(), List.of(10L), List.of("J01"), "model", "v1", LocalDateTime.now());
        ReflectionTestUtils.setField(recommendation, "recommendationId", 200L);

        when(recommendationRepository.findByAccountId(accountId)).thenReturn(Optional.of(recommendation));
        when(keywordService.getKeywordsByIds(any())).thenReturn(List.of());
        when(jobCatalogRepository.findAllById(any())).thenReturn(List.of());

        MbtiJobRecommendationResponse response = recommendationService.getLatestRecommendation(accountId, "ko");

        assertNotNull(response);
        assertEquals(200L, response.recommendationId());
    }
}
