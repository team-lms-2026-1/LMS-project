package com.teamlms.backend.domain.mbti.service;

import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MbtiRecommendationAiClient {

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

    private final ObjectProvider<ChatClient.Builder> chatClientBuilderProvider;

    public String getModelName() {
        return MODEL_NAME;
    }

    public boolean isAvailable() {
        return chatClientBuilderProvider.getIfAvailable() != null;
    }

    public String requestRecommendationJson(
            MbtiResult mbtiResult,
            List<InterestKeywordMaster> selectedKeywords,
            List<MbtiRecommendationCandidate> candidates,
            String errorHint
    ) {
        ChatClient.Builder chatClientBuilder = chatClientBuilderProvider.getIfAvailable();
        if (chatClientBuilder == null) {
            throw new IllegalStateException("ChatClient.Builder bean not found");
        }

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
            List<MbtiRecommendationCandidate> candidates,
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

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
