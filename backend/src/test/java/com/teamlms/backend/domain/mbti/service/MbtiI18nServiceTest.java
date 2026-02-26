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

import com.teamlms.backend.domain.mbti.api.dto.MbtiQuestionResponse;
import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.entity.JobCatalog;
import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.repository.InterestKeywordMasterRepository;
import com.teamlms.backend.domain.mbti.repository.JobCatalogRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiChoiceRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiQuestionRepository;

@ExtendWith(MockitoExtension.class)
class MbtiI18nServiceTest {

    @InjectMocks
    private MbtiI18nService mbtiI18nService;

    @Mock
    private MbtiQuestionRepository questionRepository;

    @Mock
    private MbtiChoiceRepository choiceRepository;

    @Mock
    private JobCatalogRepository jobCatalogRepository;

    @Mock
    private InterestKeywordMasterRepository interestKeywordRepository;

    @Test
    @DisplayName("다국어 처리 - MBTI 전체 질문 및 선택지 변환 (한국어)")
    void getAllQuestionsWithI18nAsDto_ko_Success() {
        MbtiQuestion q1 = mock(MbtiQuestion.class);
        when(q1.getQuestionId()).thenReturn(1L);
        when(q1.getContentByLocale("ko")).thenReturn("질문1");
        when(q1.getSortOrder()).thenReturn(1);

        MbtiChoice c1 = mock(MbtiChoice.class);
        when(c1.getChoiceId()).thenReturn(100L);
        when(c1.getQuestion()).thenReturn(q1);
        when(c1.getContentByLocale("ko")).thenReturn("선택지1");

        when(questionRepository.findAllOrderBySortOrder()).thenReturn(List.of(q1));
        when(choiceRepository.findByQuestionIdsOrderByQuestionAndChoiceId(List.of(1L))).thenReturn(List.of(c1));

        List<MbtiQuestionResponse> responses = mbtiI18nService.getAllQuestionsWithI18nAsDto("ko");

        assertEquals(1, responses.size());
        assertEquals("질문1", responses.get(0).content());
        assertEquals(1, responses.get(0).choices().size());
        assertEquals("선택지1", responses.get(0).choices().get(0).content());
    }

    @Test
    @DisplayName("다국어 처리 - 직업명 조회 (en)")
    void getJobCatalogWithI18n_en_Success() {
        JobCatalog job = mock(JobCatalog.class);
        when(job.getJobNameByLocale("en")).thenReturn("Developer");
        when(job.getJobNameByLocale("ko")).thenReturn("개발자");

        when(jobCatalogRepository.findById(1L)).thenReturn(Optional.of(job));

        JobCatalog result = mbtiI18nService.getJobCatalogWithI18n(1L, "en");

        assertNotNull(result);
        assertEquals("Developer", mbtiI18nService.getJobName(result, "en"));
        assertEquals("개발자", mbtiI18nService.getJobName(result, "ko")); // check fallback
    }

    @Test
    @DisplayName("다국어 처리 - 관심 키워드 및 카테고리 조회 (ja)")
    void getInterestKeywordWithI18n_ja_Success() {
        InterestKeywordMaster keyword = mock(InterestKeywordMaster.class);
        when(keyword.getKeywordByLocale("ja")).thenReturn("コーディング");
        when(keyword.getCategoryByLocale("ja")).thenReturn("IT");

        when(interestKeywordRepository.findById(100L)).thenReturn(Optional.of(keyword));

        InterestKeywordMaster result = mbtiI18nService.getInterestKeywordWithI18n(100L, "ja");

        assertNotNull(result);
        assertEquals("コーディング", mbtiI18nService.getKeyword(result, "ja"));
        assertEquals("IT", mbtiI18nService.getKeywordCategory(result, "ja"));
    }
}
