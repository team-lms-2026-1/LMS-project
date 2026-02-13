package com.teamlms.backend.domain.mbti.service;

import com.teamlms.backend.domain.mbti.api.dto.MbtiResultResponse;
import com.teamlms.backend.domain.mbti.dto.MbtiSubmitCommand;
import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import com.teamlms.backend.domain.mbti.repository.MbtiJobRecommendationRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiChoiceRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiResultRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class MbtiCommandService {

    private final MbtiChoiceRepository choiceRepository;
    private final MbtiResultRepository resultRepository;
    private final MbtiJobRecommendationRepository recommendationRepository;

    public MbtiResultResponse submitMbti(MbtiSubmitCommand command) {
        if (command == null || command.accountId() == null) {
            throw new BusinessException(ErrorCode.MBTI_SUBMIT_INVALID);
        }
        if (command.answerChoiceIds() == null || command.answerChoiceIds().isEmpty()) {
            throw new BusinessException(ErrorCode.MBTI_SUBMIT_INVALID);
        }
        if (command.answerChoiceIds().stream().anyMatch(Objects::isNull)) {
            throw new BusinessException(ErrorCode.MBTI_SUBMIT_INVALID);
        }

        List<MbtiChoice> selectedChoices = choiceRepository.findAllById(command.answerChoiceIds());
        if (selectedChoices.size() != command.answerChoiceIds().size()) {
            throw new BusinessException(ErrorCode.MBTI_ANSWER_NOT_FOUND);
        }

        // Calculate Scores
        int e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0;

        for (MbtiChoice choice : selectedChoices) {
            MbtiQuestion question = choice.getQuestion();
            if (question == null)
                continue;

            switch (question.getDimension()) {
                case EI -> {
                    e += choice.getScoreA();
                    i += choice.getScoreB();
                }
                case SN -> {
                    s += choice.getScoreA();
                    n += choice.getScoreB();
                }
                case TF -> {
                    t += choice.getScoreA();
                    f += choice.getScoreB();
                }
                case JP -> {
                    j += choice.getScoreA();
                    p += choice.getScoreB();
                }
            }
        }

        // Determine Type
        StringBuilder typeParam = new StringBuilder();
        typeParam.append(e >= i ? "E" : "I");
        typeParam.append(s >= n ? "S" : "N");
        typeParam.append(t >= f ? "T" : "F");
        typeParam.append(j >= p ? "J" : "P");

        MbtiResult result = MbtiResult.builder()
                .accountId(command.accountId())
                .mbtiType(typeParam.toString())
                .eScore(e).iScore(i)
                .sScore(s).nScore(n)
                .tScore(t).fScore(f)
                .jScore(j).pScore(p)
                .build();

        // Re-test policy: clear previous recommendation, then regenerate with new keywords.
        recommendationRepository.deleteByAccountId(command.accountId());

        MbtiResult savedResult = resultRepository.save(result);
        return MbtiResultResponse.from(savedResult);
    }
}
