package com.teamlms.backend.domain.mbti.service;

import com.teamlms.backend.domain.mbti.api.dto.MbtiResultResponse;
import com.teamlms.backend.domain.mbti.dto.MbtiSubmitCommand;
import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import com.teamlms.backend.domain.mbti.repository.MbtiChoiceRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MbtiCommandService {

    private final MbtiChoiceRepository choiceRepository;
    private final MbtiResultRepository resultRepository;

    public MbtiResultResponse submitMbti(MbtiSubmitCommand command) {
        List<MbtiChoice> selectedChoices = choiceRepository.findAllById(command.getAnswerChoiceIds());

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
                .accountId(command.getAccountId())
                .mbtiType(typeParam.toString())
                .eScore(e).iScore(i)
                .sScore(s).nScore(n)
                .tScore(t).fScore(f)
                .jScore(j).pScore(p)
                .build();

        MbtiResult savedResult = resultRepository.save(result);
        return MbtiResultResponse.from(savedResult);
    }
}
