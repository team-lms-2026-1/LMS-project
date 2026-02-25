package com.teamlms.backend.domain.mbti.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamlms.backend.domain.mbti.api.dto.MbtiJobRecommendationResponse;
import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.entity.JobCatalog;
import com.teamlms.backend.domain.mbti.entity.MbtiJobRecommendation;
import com.teamlms.backend.domain.mbti.entity.MbtiJobRecommendationItem;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import com.teamlms.backend.domain.mbti.repository.JobCatalogRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiJobRecommendationRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiResultRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.i18n.LocaleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MbtiRecommendationService {

    private static final int MAX_REASON_TEXT_LENGTH = 420;
    private static final int AI_MAX_RETRY = 3;
    private static final String PROMPT_VERSION = "mbti-job-v4";

    private final MbtiResultRepository mbtiResultRepository;
    private final MbtiJobRecommendationRepository recommendationRepository;
    private final MbtiRecommendationKeywordService keywordService;
    private final MbtiRecommendationCandidateSelector candidateSelector;
    private final MbtiRecommendationAiClient aiClient;
    private final JobCatalogRepository jobCatalogRepository;
    private final ObjectMapper objectMapper;

    public List<InterestKeywordMaster> getActiveInterestKeywords() {
        return keywordService.getActiveInterestKeywords();
    }

    @Transactional
    public MbtiJobRecommendationResponse generateRecommendation(Long accountId, List<Long> keywordIds, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        MbtiResult mbtiResult = mbtiResultRepository.findTopByAccountIdOrderByCreatedAtDesc(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MBTI_RESULT_NOT_FOUND));

        List<InterestKeywordMaster> selectedKeywords = keywordService.getValidatedKeywords(keywordIds);
        List<MbtiRecommendationCandidate> candidates = candidateSelector.selectCandidates(selectedKeywords);
        List<ResolvedRecommendation> resolved = generateByAiWithFallback(
                mbtiResult,
                selectedKeywords,
                candidates,
                normalizedLocale
        );

        List<Long> selectedKeywordIds = selectedKeywords.stream().map(InterestKeywordMaster::getId).toList();
        List<String> candidateJobCodes = candidates.stream().map(c -> c.job().getJobCode()).toList();
        LocalDateTime generatedAt = LocalDateTime.now();

        MbtiJobRecommendation saved;
        try {
            saved = upsertRecommendation(
                    accountId,
                    mbtiResult,
                    selectedKeywordIds,
                    candidateJobCodes,
                    resolved,
                    generatedAt
            );
        } catch (DataIntegrityViolationException e) {
            // Handle rare unique-key race conditions on account_id with a single retry.
            log.warn("MBTI recommendation upsert conflict for account {}. retrying once.", accountId, e);
            saved = upsertRecommendation(
                    accountId,
                    mbtiResult,
                    selectedKeywordIds,
                    candidateJobCodes,
                    resolved,
                    generatedAt
            );
        }

        return toResponse(saved, selectedKeywords, normalizedLocale);
    }

    public MbtiJobRecommendationResponse getLatestRecommendation(Long accountId, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        return recommendationRepository.findByAccountId(accountId)
                .map(saved -> toResponse(saved, keywordService.getKeywordsByIds(saved.getSelectedKeywordIds()), normalizedLocale))
                .orElse(null);
    }

    private MbtiJobRecommendation upsertRecommendation(
            Long accountId,
            MbtiResult mbtiResult,
            List<Long> selectedKeywordIds,
            List<String> candidateJobCodes,
            List<ResolvedRecommendation> resolved,
            LocalDateTime generatedAt
    ) {
        MbtiJobRecommendation recommendation = recommendationRepository.findByAccountId(accountId).orElse(null);
        boolean isNew = recommendation == null;
        if (isNew) {
            recommendation = MbtiJobRecommendation.create(
                    accountId,
                    mbtiResult,
                    selectedKeywordIds,
                    candidateJobCodes,
                    aiClient.getModelName(),
                    PROMPT_VERSION,
                    generatedAt
            );
        }

        recommendation.updateGenerated(
                mbtiResult,
                selectedKeywordIds,
                candidateJobCodes,
                aiClient.getModelName(),
                PROMPT_VERSION,
                generatedAt
        );

        // Existing row: remove old ranks first and flush, then insert new ranks.
        // This avoids unique conflicts on (recommendation_id, rank_no).
        if (!isNew && !recommendation.getItems().isEmpty()) {
            recommendation.replaceItems(List.of());
            recommendationRepository.flush();
        }

        List<MbtiJobRecommendationItem> items = new ArrayList<>();
        for (int i = 0; i < resolved.size(); i++) {
            ResolvedRecommendation rec = resolved.get(i);
            items.add(MbtiJobRecommendationItem.builder()
                    .recommendation(recommendation)
                    .rankNo(i + 1)
                    .jobCatalogId(rec.job().getId())
                    .jobCode(rec.job().getJobCode())
                    .jobName(rec.job().getJobName())
                    .reasonText(limitReasonText(rec.reason()))
                    .build());
        }
        recommendation.replaceItems(items);

        if (isNew) {
            return recommendationRepository.save(recommendation);
        }

        recommendationRepository.flush();
        return recommendation;
    }

    private List<ResolvedRecommendation> generateByAiWithFallback(
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords,
            List<MbtiRecommendationCandidate> candidates,
            String locale
    ) {
        if (!aiClient.isAvailable()) {
            log.warn("ChatClient.Builder bean not found. Using template fallback recommendations.");
            return fallbackRecommendations(mbtiResult, selectedKeywords, candidates, locale);
        }

        Map<String, MbtiRecommendationCandidate> candidateMap = candidates.stream()
                .collect(java.util.stream.Collectors.toMap(c -> c.job().getJobCode(), c -> c, (a, b) -> a, LinkedHashMap::new));

        String errorHint = null;
        for (int attempt = 1; attempt <= AI_MAX_RETRY; attempt++) {
            try {
                String raw = aiClient.requestRecommendationJson(mbtiResult, selectedKeywords, candidates, errorHint, locale);
                return parseAndResolve(raw, candidateMap, mbtiResult, selectedKeywords, locale);
            } catch (Exception e) {
                errorHint = e.getMessage();
                log.warn("MBTI recommendation AI attempt {} failed: {}", attempt, e.getMessage());
            }
        }
        return fallbackRecommendations(mbtiResult, selectedKeywords, candidates, locale);
    }

    private List<ResolvedRecommendation> parseAndResolve(
            String raw,
            Map<String, MbtiRecommendationCandidate> candidateMap,
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords,
            String locale
    ) throws Exception {
        JsonNode root = objectMapper.readTree(raw);
        JsonNode recommendationsNode = root.get("recommendations");
        if (recommendationsNode == null || !recommendationsNode.isArray() || recommendationsNode.size() != 5) {
            throw new IllegalStateException("recommendations must have exactly 5 items");
        }

        Set<String> uniqueCodes = new HashSet<>();
        List<ResolvedRecommendation> resolved = new ArrayList<>();

        for (JsonNode recNode : recommendationsNode) {
            String jobCode = recNode.path("jobCode").asText("").trim();
            if (jobCode.isBlank()) {
                throw new IllegalStateException("jobCode is required");
            }
            if (!uniqueCodes.add(jobCode)) {
                throw new IllegalStateException("duplicate jobCode");
            }

            MbtiRecommendationCandidate candidate = candidateMap.get(jobCode);
            if (candidate == null) {
                throw new IllegalStateException("jobCode is outside candidates");
            }

            String reason = recNode.path("reason").asText("").trim();
            if (reason.isBlank()) {
                throw new IllegalStateException("reason is blank");
            }
            resolved.add(new ResolvedRecommendation(
                    candidate.job(),
                    normalizeReason(candidate, reason, mbtiResult.getMbtiType(), selectedKeywords, locale)
            ));
        }

        return resolved;
    }

    private List<ResolvedRecommendation> fallbackRecommendations(
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords,
            List<MbtiRecommendationCandidate> candidates,
            String locale
    ) {
        if (candidates.size() < 5) {
            throw new BusinessException(ErrorCode.MBTI_JOB_CATALOG_EMPTY);
        }

        List<ResolvedRecommendation> fallback = new ArrayList<>(5);
        for (int i = 0; i < 5; i++) {
            MbtiRecommendationCandidate candidate = candidates.get(i);
            fallback.add(new ResolvedRecommendation(
                    candidate.job(),
                    buildTemplateReason(candidate, mbtiResult.getMbtiType(), selectedKeywords, locale)
            ));
        }
        return fallback;
    }

    private MbtiJobRecommendationResponse toResponse(
            MbtiJobRecommendation recommendation,
            List<InterestKeywordMaster> selectedKeywords,
            String locale
    ) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        List<Long> selectedKeywordIds = recommendation.getSelectedKeywordIds() == null
                ? List.of()
                : recommendation.getSelectedKeywordIds();
        Map<Long, InterestKeywordMaster> keywordMap = selectedKeywords.stream()
                .collect(java.util.stream.Collectors.toMap(InterestKeywordMaster::getId, v -> v, (a, b) -> a, HashMap::new));

        List<MbtiJobRecommendationResponse.SelectedKeyword> keywords = selectedKeywordIds.stream()
                .map(keywordMap::get)
                .filter(Objects::nonNull)
                .map(k -> new MbtiJobRecommendationResponse.SelectedKeyword(
                        k.getId(),
                        k.getKeywordByLocale(normalizedLocale),
                        k.getCategoryByLocale(normalizedLocale)
                ))
                .toList();

        List<Long> jobCatalogIds = recommendation.getItems().stream()
                .map(MbtiJobRecommendationItem::getJobCatalogId)
                .distinct()
                .toList();
        Map<Long, JobCatalog> jobCatalogMap = jobCatalogRepository.findAllById(jobCatalogIds).stream()
                .collect(java.util.stream.Collectors.toMap(JobCatalog::getId, v -> v, (a, b) -> a, HashMap::new));

        List<MbtiJobRecommendationResponse.RecommendedJob> jobs = recommendation.getItems().stream()
                .map(item -> {
                    JobCatalog jobCatalog = jobCatalogMap.get(item.getJobCatalogId());
                    String localizedJobName = resolveLocalizedJobName(item, jobCatalog, normalizedLocale);
                    String localizedReason = resolveLocalizedReason(
                            item,
                            jobCatalog,
                            localizedJobName,
                            recommendation.getMbtiType(),
                            selectedKeywords,
                            normalizedLocale
                    );
                    return new MbtiJobRecommendationResponse.RecommendedJob(
                            item.getRankNo(),
                            item.getJobCatalogId(),
                            item.getJobCode(),
                            localizedJobName,
                            localizedReason
                    );
                })
                .toList();

        return new MbtiJobRecommendationResponse(
                recommendation.getRecommendationId(),
                recommendation.getMbtiResult().getResultId(),
                recommendation.getMbtiType(),
                keywords,
                jobs,
                recommendation.getGeneratedAt()
        );
    }

    private String resolveLocalizedJobName(
            MbtiJobRecommendationItem item,
            JobCatalog jobCatalog,
            String locale
    ) {
        if (jobCatalog == null) {
            return item.getJobName();
        }
        return jobCatalog.getJobNameByLocale(locale);
    }

    private String resolveLocalizedReason(
            MbtiJobRecommendationItem item,
            JobCatalog jobCatalog,
            String localizedJobName,
            String mbtiType,
            List<InterestKeywordMaster> selectedKeywords,
            String locale
    ) {
        String normalizedReason = cleanReasonText(item.getReasonText());
        if ("ko".equals(locale)) {
            return normalizedReason;
        }
        if (isReasonAlignedWithLocale(normalizedReason, locale)) {
            return normalizedReason;
        }

        String keyword = selectedKeywords.isEmpty()
                ? defaultInterestLabel(locale)
                : selectedKeywords.get(0).getKeywordByLocale(locale);
        String track = resolveLocalizedTrack(jobCatalog, locale);
        return limitReasonText(cleanReasonText(
                buildTemplateReasonText(localizedJobName, mbtiType, keyword, track, locale)
        ));
    }

    private boolean isReasonAlignedWithLocale(String reason, String locale) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        if ("en".equals(normalizedLocale)) {
            return containsLatin(reason) && !containsHangul(reason);
        }
        if ("ja".equals(normalizedLocale)) {
            return containsJapanese(reason) && !containsHangul(reason);
        }
        return containsHangul(reason);
    }

    private String normalizeReason(
            MbtiRecommendationCandidate candidate,
            String rawReason,
            String mbtiType,
            List<InterestKeywordMaster> selectedKeywords,
            String locale
    ) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        String template = buildTemplateReason(candidate, mbtiType, selectedKeywords, normalizedLocale);
        String normalized = limitReasonText(cleanReasonText(rawReason));
        if (isWeakReason(normalized, normalizedLocale)) {
            return template;
        }
        return normalized;
    }

    private String buildTemplateReason(
            MbtiRecommendationCandidate candidate,
            String mbtiType,
            List<InterestKeywordMaster> selectedKeywords,
            String locale
    ) {
        String normalizedLocale = LocaleUtil.normalize(locale);
        String localizedJobName = candidate.job().getJobNameByLocale(normalizedLocale);
        String localizedKeyword = resolveLocalizedKeyword(candidate, selectedKeywords, normalizedLocale);
        String localizedTrack = resolveLocalizedTrack(candidate.job(), normalizedLocale);
        return limitReasonText(cleanReasonText(
                buildTemplateReasonText(localizedJobName, mbtiType, localizedKeyword, localizedTrack, normalizedLocale)
        ));
    }

    private String buildTemplateReasonText(
            String jobName,
            String mbtiType,
            String keyword,
            String track,
            String locale
    ) {
        return switch (LocaleUtil.normalize(locale)) {
            case "en" -> """
                    Your MBTI %s profile aligns well with the problem-solving and collaboration style required in %s roles. \
                    The role connects naturally with your interest in %s, which helps sustain motivation and learning focus. \
                    Building %s capability through projects and hands-on practice can accelerate on-the-job adaptation and long-term career growth.
                    """.formatted(mbtiType, jobName, keyword, track);
            case "ja" -> """
                    MBTI %sの傾向は、%s職務で求められる問題解決と協働スタイルに適しています。 \
                    とくに%sへの関心と業務の接点が明確で、学習意欲と集中を維持しやすいです。 \
                    %sの力をプロジェクトと実践で積み上げることで、現場適応を早め、長期的なキャリア拡張にも有利です。
                    """.formatted(mbtiType, jobName, keyword, track);
            default -> """
                    MBTI %s 성향은 %s 직무에서 요구되는 문제 해결과 협업 방식에 잘 맞습니다. \
                    특히 %s 관심 키워드와 연결되는 업무 맥락이 분명해서 학습 동기와 몰입을 유지하기 좋습니다. \
                    %s 역량을 프로젝트와 실습으로 쌓아가면 현장 적응 속도를 높이고 장기 진로 확장에도 유리합니다.
                    """.formatted(mbtiType, jobName, keyword, track);
        };
    }

    private String cleanReasonText(String text) {
        if (text == null) {
            return "";
        }
        return text
                .replace("\r", " ")
                .replace("\n", " ")
                .replace("\t", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean isWeakReason(String line, String locale) {
        if (line == null || line.isBlank()) {
            return true;
        }
        String compact = line.replace(" ", "");
        if (compact.length() < 45) {
            return true;
        }
        if ("ko".equals(locale) && !containsHangul(line)) {
            return true;
        }
        if ("en".equals(locale) && (!containsLatin(line) || containsHangul(line))) {
            return true;
        }
        if ("ja".equals(locale) && (!containsJapanese(line) || containsHangul(line))) {
            return true;
        }
        return compact.equals("추천합니다") || compact.equals("적합합니다");
    }

    private boolean containsHangul(String text) {
        return text != null && text.matches(".*[가-힣].*");
    }

    private boolean containsLatin(String text) {
        return text != null && text.matches(".*[A-Za-z].*");
    }

    private boolean containsJapanese(String text) {
        return text != null && text.matches(".*[\\u3040-\\u30FF\\u4E00-\\u9FFF].*");
    }

    private String resolveLocalizedKeyword(
            MbtiRecommendationCandidate candidate,
            List<InterestKeywordMaster> selectedKeywords,
            String locale
    ) {
        if (!candidate.matchedKeywords().isEmpty()) {
            String matchedKeyword = candidate.matchedKeywords().get(0);
            for (InterestKeywordMaster keyword : selectedKeywords) {
                if (matchedKeyword.equals(keyword.getKeyword())) {
                    return keyword.getKeywordByLocale(locale);
                }
            }
            return matchedKeyword;
        }
        if (!selectedKeywords.isEmpty()) {
            return selectedKeywords.get(0).getKeywordByLocale(locale);
        }
        return defaultInterestLabel(locale);
    }

    private String resolveLocalizedTrack(JobCatalog jobCatalog, String locale) {
        if (jobCatalog == null) {
            return defaultRelatedFieldLabel(locale);
        }
        return firstNonBlank(
                jobCatalog.getMinorNameByLocale(locale),
                jobCatalog.getMiddleNameByLocale(locale),
                jobCatalog.getMajorNameByLocale(locale),
                defaultRelatedFieldLabel(locale)
        );
    }

    private String defaultInterestLabel(String locale) {
        return switch (LocaleUtil.normalize(locale)) {
            case "en" -> "interest area";
            case "ja" -> "関心分野";
            default -> "관심 분야";
        };
    }

    private String defaultRelatedFieldLabel(String locale) {
        return switch (LocaleUtil.normalize(locale)) {
            case "en" -> "related field";
            case "ja" -> "関連分野";
            default -> "관련 분야";
        };
    }

    private String firstNonBlank(String a, String b, String c, String fallback) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        if (c != null && !c.isBlank()) {
            return c;
        }
        return fallback;
    }

    private int charLength(String value) {
        return value.codePointCount(0, value.length());
    }

    private String limitReasonText(String line) {
        String trimmed = line == null ? "" : line.trim();
        if (charLength(trimmed) <= MAX_REASON_TEXT_LENGTH) {
            return trimmed;
        }
        int cut = 0;
        int count = 0;
        while (cut < trimmed.length() && count < MAX_REASON_TEXT_LENGTH) {
            int cp = trimmed.codePointAt(cut);
            cut += Character.charCount(cp);
            count++;
        }
        return trimmed.substring(0, cut);
    }

    private record ResolvedRecommendation(JobCatalog job, String reason) {
    }
}


