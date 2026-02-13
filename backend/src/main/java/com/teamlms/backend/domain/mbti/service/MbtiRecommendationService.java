package com.teamlms.backend.domain.mbti.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamlms.backend.domain.mbti.api.dto.MbtiJobRecommendationResponse;
import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.entity.JobCatalog;
import com.teamlms.backend.domain.mbti.entity.MbtiJobRecommendation;
import com.teamlms.backend.domain.mbti.entity.MbtiJobRecommendationItem;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import com.teamlms.backend.domain.mbti.repository.InterestKeywordMasterRepository;
import com.teamlms.backend.domain.mbti.repository.JobCatalogRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiJobRecommendationRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiResultRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MbtiRecommendationService {

    private static final int CANDIDATE_SIZE = 40;
    private static final int MAX_REASON_TEXT_LENGTH = 420;
    private static final int AI_MAX_RETRY = 3;
    private static final String PROMPT_VERSION = "mbti-job-v3";
    private static final String MODEL_NAME = "gpt-4o-mini";
    private static final String OUTPUT_SCHEMA = """
            {
              "type": "object",
              "additionalProperties": false,
              "required": ["recommendations"],
              "properties": {
                "recommendations": {
                  "type": "array",
                  "minItems": 5,
                  "maxItems": 5,
                  "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["jobCode", "reason"],
                    "properties": {
                      "jobCode": { "type": "string" },
                      "reason": { "type": "string", "minLength": 60, "maxLength": 420 }
                    }
                  }
                }
              }
            }
            """;

    private final MbtiResultRepository mbtiResultRepository;
    private final InterestKeywordMasterRepository keywordRepository;
    private final JobCatalogRepository jobCatalogRepository;
    private final MbtiJobRecommendationRepository recommendationRepository;
    private final ObjectProvider<ChatClient.Builder> chatClientBuilderProvider;
    private final ObjectMapper objectMapper;

    public List<InterestKeywordMaster> getActiveInterestKeywords() {
        return keywordRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    @Transactional
    public MbtiJobRecommendationResponse generateRecommendation(Long accountId, List<Long> keywordIds) {
        MbtiResult mbtiResult = mbtiResultRepository.findTopByAccountIdOrderByCreatedAtDesc(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MBTI_RESULT_NOT_FOUND));

        List<InterestKeywordMaster> selectedKeywords = getValidatedKeywords(keywordIds);
        List<JobCandidate> candidates = selectCandidates(selectedKeywords);
        List<ResolvedRecommendation> resolved = generateByAiWithFallback(mbtiResult, selectedKeywords, candidates);

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

        return toResponse(saved, selectedKeywords);
    }

    public MbtiJobRecommendationResponse getLatestRecommendation(Long accountId) {
        return recommendationRepository.findByAccountId(accountId)
                .map(saved -> toResponse(saved, getKeywordsByIds(saved.getSelectedKeywordIds())))
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
                    MODEL_NAME,
                    PROMPT_VERSION,
                    generatedAt
            );
        }

        recommendation.updateGenerated(
                mbtiResult,
                selectedKeywordIds,
                candidateJobCodes,
                MODEL_NAME,
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

    private List<InterestKeywordMaster> getValidatedKeywords(List<Long> keywordIds) {
        if (keywordIds == null || keywordIds.size() < 2) {
            throw new BusinessException(ErrorCode.MBTI_KEYWORD_MIN_REQUIRED);
        }
        LinkedHashSet<Long> dedup = keywordIds.stream().filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        if (dedup.size() < 2) {
            throw new BusinessException(ErrorCode.MBTI_KEYWORD_MIN_REQUIRED);
        }
        List<InterestKeywordMaster> found = keywordRepository.findByIdInAndActiveTrue(dedup);
        if (found.size() != dedup.size()) {
            throw new BusinessException(ErrorCode.MBTI_KEYWORD_INVALID);
        }

        Map<Long, InterestKeywordMaster> map = found.stream()
                .collect(java.util.stream.Collectors.toMap(InterestKeywordMaster::getId, v -> v));
        List<InterestKeywordMaster> ordered = new ArrayList<>();
        for (Long id : dedup) {
            InterestKeywordMaster keyword = map.get(id);
            if (keyword == null) {
                throw new BusinessException(ErrorCode.MBTI_KEYWORD_INVALID);
            }
            ordered.add(keyword);
        }
        return ordered;
    }

    private List<InterestKeywordMaster> getKeywordsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<InterestKeywordMaster> found = keywordRepository.findByIdInAndActiveTrue(ids);
        Map<Long, InterestKeywordMaster> map = found.stream()
                .collect(java.util.stream.Collectors.toMap(InterestKeywordMaster::getId, v -> v));
        List<InterestKeywordMaster> ordered = new ArrayList<>();
        for (Long id : ids) {
            InterestKeywordMaster keyword = map.get(id);
            if (keyword != null) {
                ordered.add(keyword);
            }
        }
        return ordered;
    }

    private List<JobCandidate> selectCandidates(List<InterestKeywordMaster> selectedKeywords) {
        String latestVersion = jobCatalogRepository.findLatestVersion();
        List<JobCatalog> jobs = latestVersion == null
                ? jobCatalogRepository.findAll()
                : jobCatalogRepository.findByVersionOrderByIdAsc(latestVersion);

        if (jobs.size() < 5) {
            throw new BusinessException(ErrorCode.MBTI_JOB_CATALOG_EMPTY);
        }

        List<JobCandidate> scored = new ArrayList<>();
        for (JobCatalog job : jobs) {
            int score = 0;
            Set<String> matched = new LinkedHashSet<>();
            String searchText = lower(job.getSearchText());
            String jobName = lower(job.getJobName());
            String major = lower(job.getMajorName());
            String middle = lower(job.getMiddleName());
            String minor = lower(job.getMinorName());

            for (InterestKeywordMaster keyword : selectedKeywords) {
                String kw = lower(keyword.getKeyword());
                if (kw.isBlank()) {
                    continue;
                }
                boolean hit = false;
                if (searchText.contains(kw)) {
                    score += 4;
                    hit = true;
                }
                if (jobName.contains(kw)) {
                    score += 5;
                    hit = true;
                }
                if (major.contains(kw) || middle.contains(kw) || minor.contains(kw)) {
                    score += 2;
                    hit = true;
                }
                if (hit) {
                    matched.add(keyword.getKeyword());
                }
            }

            scored.add(new JobCandidate(job, score, new ArrayList<>(matched)));
        }

        scored.sort(Comparator
                .comparingInt(JobCandidate::score).reversed()
                .thenComparing((JobCandidate c) -> c.matchedKeywords().size(), Comparator.reverseOrder())
                .thenComparing(c -> c.job().getId()));

        return scored.subList(0, Math.min(CANDIDATE_SIZE, scored.size()));
    }

    private List<ResolvedRecommendation> generateByAiWithFallback(
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords,
            List<JobCandidate> candidates
    ) {
        ChatClient.Builder chatClientBuilder = chatClientBuilderProvider.getIfAvailable();
        if (chatClientBuilder == null) {
            log.warn("ChatClient.Builder bean not found. Using template fallback recommendations.");
            return fallbackRecommendations(mbtiResult, selectedKeywords, candidates);
        }

        Map<String, JobCandidate> candidateMap = candidates.stream()
                .collect(java.util.stream.Collectors.toMap(c -> c.job().getJobCode(), c -> c, (a, b) -> a, LinkedHashMap::new));

        String errorHint = null;
        for (int attempt = 1; attempt <= AI_MAX_RETRY; attempt++) {
            try {
                String raw = requestAiContent(chatClientBuilder, mbtiResult, selectedKeywords, candidates, errorHint);
                return parseAndResolve(raw, candidateMap, mbtiResult, selectedKeywords);
            } catch (Exception e) {
                errorHint = e.getMessage();
                log.warn("MBTI recommendation AI attempt {} failed: {}", attempt, e.getMessage());
            }
        }
        return fallbackRecommendations(mbtiResult, selectedKeywords, candidates);
    }

    private String requestAiContent(
            ChatClient.Builder chatClientBuilder,
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords,
            List<JobCandidate> candidates,
            String errorHint
    ) {
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .temperature(0.3)
                .maxTokens(1100)
                .outputSchema(OUTPUT_SCHEMA)
                .build();

        String systemPrompt = """
                You are a career recommendation engine for university students in Korea.
                Return JSON only and strictly follow the provided schema.
                Hard constraints:
                - Select exactly 5 recommendations.
                - Use unique jobCode values.
                - Use only jobCode values from the candidate list.
                - reason must be one natural Korean paragraph.
                - reason must not contain list markers, markdown, or line breaks.
                - reason should be specific and evidence-based for each student profile.
                - reason must include:
                  1) MBTI strength fit
                  2) selected interest keyword fit
                  3) practical growth path in the role
                """;

        String userPrompt = buildUserPrompt(mbtiResult, selectedKeywords, candidates, errorHint);
        String content = chatClientBuilder.build().prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .options(options)
                .call()
                .content();

        if (content == null || content.isBlank()) {
            throw new IllegalStateException("Empty AI response");
        }
        return content;
    }

    private String buildUserPrompt(
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords,
            List<JobCandidate> candidates,
            String errorHint
    ) {
        String keywords = selectedKeywords.stream().map(InterestKeywordMaster::getKeyword)
                .collect(java.util.stream.Collectors.joining(", "));

        String candidateLines = candidates.stream()
                .map(c -> String.format(
                        "- jobCode=%s | jobName=%s | major=%s | middle=%s | minor=%s | matchedKeywords=%s | score=%d",
                        nullSafe(c.job().getJobCode()),
                        nullSafe(c.job().getJobName()),
                        nullSafe(c.job().getMajorName()),
                        nullSafe(c.job().getMiddleName()),
                        nullSafe(c.job().getMinorName()),
                        c.matchedKeywords().isEmpty() ? "none" : String.join("/", c.matchedKeywords()),
                        c.score()
                ))
                .collect(java.util.stream.Collectors.joining("\n"));

        String retryHint = (errorHint == null || errorHint.isBlank())
                ? ""
                : "\nPrevious output issue: " + errorHint + "\nFix the issue and regenerate valid JSON.\n";

        return """
                Student profile:
                - MBTI type: %s
                - MBTI scores: E=%d, I=%d, S=%d, N=%d, T=%d, F=%d, J=%d, P=%d
                - Selected interest keywords: %s

                Candidate jobs (choose only from this list):
                %s
                %s
                Output requirements:
                - Exactly 5 jobs
                - reason must be one paragraph per job
                - each reason should be around 2~4 sentences
                - each reason must be natural Korean with concrete details
                - do not use line breaks or bullet lists
                - avoid repetitive generic wording
                """.formatted(
                mbtiResult.getMbtiType(),
                mbtiResult.getEScore(), mbtiResult.getIScore(),
                mbtiResult.getSScore(), mbtiResult.getNScore(),
                mbtiResult.getTScore(), mbtiResult.getFScore(),
                mbtiResult.getJScore(), mbtiResult.getPScore(),
                keywords,
                candidateLines,
                retryHint
        );
    }

    private List<ResolvedRecommendation> parseAndResolve(
            String raw,
            Map<String, JobCandidate> candidateMap,
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords
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

            JobCandidate candidate = candidateMap.get(jobCode);
            if (candidate == null) {
                throw new IllegalStateException("jobCode is outside candidates");
            }

            String reason = recNode.path("reason").asText("").trim();
            if (reason.isBlank()) {
                throw new IllegalStateException("reason is blank");
            }
            resolved.add(new ResolvedRecommendation(
                    candidate.job(),
                    normalizeReason(candidate, reason, mbtiResult.getMbtiType(), selectedKeywords)
            ));
        }

        return resolved;
    }

    private List<ResolvedRecommendation> fallbackRecommendations(
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords,
            List<JobCandidate> candidates
    ) {
        if (candidates.size() < 5) {
            throw new BusinessException(ErrorCode.MBTI_JOB_CATALOG_EMPTY);
        }

        List<ResolvedRecommendation> fallback = new ArrayList<>(5);
        for (int i = 0; i < 5; i++) {
            JobCandidate candidate = candidates.get(i);
            fallback.add(new ResolvedRecommendation(
                    candidate.job(),
                    buildTemplateReason(candidate, mbtiResult.getMbtiType(), selectedKeywords)
            ));
        }
        return fallback;
    }

    private MbtiJobRecommendationResponse toResponse(MbtiJobRecommendation recommendation, List<InterestKeywordMaster> selectedKeywords) {
        List<Long> selectedKeywordIds = recommendation.getSelectedKeywordIds() == null
                ? List.of()
                : recommendation.getSelectedKeywordIds();
        Map<Long, InterestKeywordMaster> keywordMap = selectedKeywords.stream()
                .collect(java.util.stream.Collectors.toMap(InterestKeywordMaster::getId, v -> v, (a, b) -> a, HashMap::new));

        List<MbtiJobRecommendationResponse.SelectedKeyword> keywords = selectedKeywordIds.stream()
                .map(keywordMap::get)
                .filter(Objects::nonNull)
                .map(k -> new MbtiJobRecommendationResponse.SelectedKeyword(k.getId(), k.getKeyword(), k.getCategory()))
                .toList();

        List<MbtiJobRecommendationResponse.RecommendedJob> jobs = recommendation.getItems().stream()
                .map(item -> new MbtiJobRecommendationResponse.RecommendedJob(
                        item.getRankNo(),
                        item.getJobCatalogId(),
                        item.getJobCode(),
                        item.getJobName(),
                        item.getReasonText()
                ))
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

    private String normalizeReason(
            JobCandidate candidate,
            String rawReason,
            String mbtiType,
            List<InterestKeywordMaster> selectedKeywords
    ) {
        String template = buildTemplateReason(candidate, mbtiType, selectedKeywords);
        String normalized = limitReasonText(cleanReasonText(rawReason));
        if (isWeakReason(normalized)) {
            return template;
        }
        return normalized;
    }

    private String buildTemplateReason(
            JobCandidate candidate,
            String mbtiType,
            List<InterestKeywordMaster> selectedKeywords
    ) {
        String keyword = !candidate.matchedKeywords().isEmpty()
                ? candidate.matchedKeywords().get(0)
                : (selectedKeywords.isEmpty() ? "관심 분야" : selectedKeywords.get(0).getKeyword());

        String track = firstNonBlank(
                candidate.job().getMinorName(),
                candidate.job().getMiddleName(),
                candidate.job().getMajorName(),
                "관련 분야"
        );

        String paragraph = """
                MBTI %s 성향은 %s 직무에서 요구되는 문제 해결과 협업 방식에 잘 맞습니다. \
                특히 %s 관심 키워드와 연결되는 업무 맥락이 분명해서 학습 동기와 몰입을 유지하기 좋습니다. \
                %s 역량을 프로젝트와 실습으로 쌓아가면 현장 적응 속도를 높이고 장기 진로 확장에도 유리합니다.
                """.formatted(
                mbtiType,
                candidate.job().getJobName(),
                keyword,
                track
        );
        return limitReasonText(cleanReasonText(paragraph));
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

    private boolean isWeakReason(String line) {
        if (line == null || line.isBlank()) {
            return true;
        }
        if (!containsHangul(line)) {
            return true;
        }
        String compact = line.replace(" ", "");
        if (compact.length() < 45) {
            return true;
        }
        return compact.equals("추천합니다") || compact.equals("적합합니다");
    }

    private boolean containsHangul(String text) {
        return text != null && text.matches(".*[가-힣].*");
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

    private String lower(String value) {
        return value == null ? "" : value.toLowerCase();
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
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

    private record JobCandidate(JobCatalog job, int score, List<String> matchedKeywords) {
    }

    private record ResolvedRecommendation(JobCatalog job, String reason) {
    }
}


