package com.teamlms.backend.domain.mbti.service;

import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import com.teamlms.backend.domain.mbti.entity.JobCatalog;
import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.repository.*;
import com.teamlms.backend.domain.mbti.api.dto.MbtiQuestionResponse;
import com.teamlms.backend.global.i18n.LocaleUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * MBTI 관련 다국어 데이터 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MbtiI18nService {

    private final MbtiQuestionRepository questionRepository;
    private final MbtiChoiceRepository choiceRepository;
    private final JobCatalogRepository jobCatalogRepository;
    private final InterestKeywordMasterRepository interestKeywordRepository;

    /**
     * 모든 MBTI 질문 조회 (locale별) - DTO 변환 포함
     * @param locale locale code (ko, en, ja)
     * @return MBTI 질문 Response 목록 (DTO 변환 완료)
     */
    public List<MbtiQuestionResponse> getAllQuestionsWithI18nAsDto(String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        List<MbtiQuestion> questions = questionRepository.findAllOrderBySortOrder();

        if (questions.isEmpty()) {
            return List.of();
        }

        // 모든 질문 ID 추출
        List<Long> questionIds = questions.stream()
                .map(MbtiQuestion::getQuestionId)
                .toList();
        
        // 배치로 모든 선택지 로드
        List<MbtiChoice> allChoices = choiceRepository.findByQuestionIdsOrderByQuestionAndChoiceId(questionIds);
        
        // 질문별로 선택지 그룹화
        Map<Long, List<MbtiChoice>> choicesByQuestionId = allChoices.stream()
                .collect(Collectors.groupingBy(c -> c.getQuestion().getQuestionId()));

        // 질문 엔티티를 DTO로 변환 (Transaction 내에서 수행)
        return questions.stream()
                .map(question -> {
                    List<MbtiChoice> questionChoices = choicesByQuestionId.getOrDefault(question.getQuestionId(), List.of());
                    return new MbtiQuestionResponse(
                            question.getQuestionId(),
                            this.getQuestionContent(question, normalizedLocale),
                            question.getSortOrder(),
                            questionChoices.stream()
                                    .map(choice -> new com.teamlms.backend.domain.mbti.api.dto.MbtiChoiceResponse(
                                            choice.getChoiceId(),
                                            this.getChoiceContent(choice, normalizedLocale)
                                    ))
                                    .toList(),
                            question.getCreatedAt(),
                            question.getUpdatedAt()
                    );
                })
                .toList();
    }

    /**
     * 모든 MBTI 질문 조회 (locale별) - 엔티티 반환 (deprecated)
     * @param locale locale code (ko, en, ja)
     * @return MBTI 질문 목록
     * @deprecated 대신 getAllQuestionsWithI18nAsDto 사용
     */
    @Deprecated(since = "1.0", forRemoval = true)
    public List<MbtiQuestion> getAllQuestionsWithI18n(String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        List<MbtiQuestion> questions = questionRepository.findAllOrderBySortOrder();

        if (questions.isEmpty()) {
            return questions;
        }

        // 모든 질문 ID 추출
        List<Long> questionIds = questions.stream()
                .map(MbtiQuestion::getQuestionId)
                .toList();
        
        // 배치로 모든 선택지 로드
        List<MbtiChoice> allChoices = choiceRepository.findByQuestionIdsOrderByQuestionAndChoiceId(questionIds);
        
        // 질문별로 선택지 그룹화
        Map<Long, List<MbtiChoice>> choicesByQuestionId = allChoices.stream()
                .collect(Collectors.groupingBy(c -> c.getQuestion().getQuestionId()));

        // 각 질문 객체의 choices 필드 설정 (메모리에서 처리)
        questions.forEach(question -> {
            List<MbtiChoice> questionChoices = choicesByQuestionId.getOrDefault(question.getQuestionId(), List.of());
            question.setChoices(new java.util.ArrayList<>(questionChoices));
        });

        return questions;
    }

    /**
     * MBTI 선택지 조회 (locale별)
     * @param questionId question ID
     * @param locale locale code (ko, en, ja)
     * @return MBTI 선택지 목록
     */
    public List<MbtiChoice> getChoicesByQuestionWithI18n(Long questionId, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return choiceRepository.findByQuestionIdOrderBySortOrder(questionId);
    }

    /**
     * 직업 조회 (locale별)
     * @param jobId job ID
     * @param locale locale code (ko, en, ja)
     * @return 직업 정보
     */
    public JobCatalog getJobCatalogWithI18n(Long jobId, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return jobCatalogRepository.findById(jobId).orElse(null);
    }

    /**
     * 관심 키워드 조회 (locale별)
     * @param keywordId keyword ID
     * @param locale locale code (ko, en, ja)
     * @return 관심 키워드
     */
    public InterestKeywordMaster getInterestKeywordWithI18n(Long keywordId, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return interestKeywordRepository.findById(keywordId).orElse(null);
    }

    /**
     * 모든 관심 키워드 조회 (locale별)
     * @param locale locale code (ko, en, ja)
     * @return 관심 키워드 목록
     */
    public List<InterestKeywordMaster> getAllInterestKeywordsWithI18n(String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return interestKeywordRepository.findAllByActiveTrueOrderBySortOrder();
    }

    /**
     * 주어진 locale에 맞는 MBTI 질문 내용 반환
     * @param question MBTI 질문 엔티티
     * @param locale locale code
     * @return locale별 내용, 없으면 기본값 반환
     */
    public String getQuestionContent(MbtiQuestion question, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return question.getContentByLocale(normalizedLocale);
    }

    /**
     * 주어진 locale에 맞는 MBTI 선택지 내용 반환
     * @param choice MBTI 선택지 엔티티
     * @param locale locale code
     * @return locale별 내용, 없으면 기본값 반환
     */
    public String getChoiceContent(MbtiChoice choice, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return choice.getContentByLocale(normalizedLocale);
    }

    /**
     * 주어진 locale에 맞는 직업명 반환
     * @param jobCatalog 직업 엔티티
     * @param locale locale code
     * @return locale별 직업명, 없으면 기본값 반환
     */
    public String getJobName(JobCatalog jobCatalog, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return jobCatalog.getJobNameByLocale(normalizedLocale);
    }

    /**
     * 주어진 locale에 맞는 관심 키워드 반환
     * @param keyword 관심 키워드 엔티티
     * @param locale locale code
     * @return locale별 키워드, 없으면 기본값 반환
     */
    public String getKeyword(InterestKeywordMaster keyword, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return keyword.getKeywordByLocale(normalizedLocale);
    }

    /**
     * 주어진 locale에 맞는 관심 키워드 카테고리 반환
     * @param keyword 관심 키워드 엔티티
     * @param locale locale code
     * @return locale별 카테고리, 없으면 기본값 반환
     */
    public String getKeywordCategory(InterestKeywordMaster keyword, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return keyword.getCategoryByLocale(normalizedLocale);
    }
}
