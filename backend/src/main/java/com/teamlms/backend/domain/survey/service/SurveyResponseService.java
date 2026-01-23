package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.survey.api.dto.SurveySubmitRequest; // 외부 DTO
import com.teamlms.backend.domain.survey.entity.SurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.repository.SurveyTargetRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SurveyResponseService {

    private final SurveyTargetRepository targetRepository;

    public void submitResponse(Long userId, SurveySubmitRequest request) {
        SurveyTarget target = targetRepository.findBySurveyIdAndTargetAccountId(request.getSurveyId(), userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_TARGET));

        if (target.getStatus() == SurveyTargetStatus.SUBMITTED) {
            throw new BusinessException(ErrorCode.SURVEY_ALREADY_SUBMITTED);
        }

        target.submit(request.getResponses());
    }
}