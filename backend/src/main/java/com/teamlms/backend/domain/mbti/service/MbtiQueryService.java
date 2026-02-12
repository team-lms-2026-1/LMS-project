package com.teamlms.backend.domain.mbti.service;

import com.teamlms.backend.domain.mbti.api.dto.MbtiQuestionResponse;
import com.teamlms.backend.domain.mbti.api.dto.MbtiResultResponse;
import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.repository.MbtiQuestionRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MbtiQueryService {

    private final MbtiQuestionRepository questionRepository;
    private final MbtiResultRepository resultRepository;

    public List<MbtiQuestionResponse> getAllQuestions() {
        List<MbtiQuestion> questions = questionRepository.findAllWithChoices();
        return questions.stream()
                .map(MbtiQuestionResponse::from)
                .collect(Collectors.toList());
    }

    public MbtiResultResponse getLatestResult(Long accountId) {
        return resultRepository.findTopByAccountIdOrderByCreatedAtDesc(accountId)
                .map(MbtiResultResponse::from)
                .orElse(null);
    }
}
