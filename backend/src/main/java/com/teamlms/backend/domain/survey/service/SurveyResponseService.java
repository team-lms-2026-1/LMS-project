package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.survey.api.dto.SurveySubmitRequest; // 외부 DTO
import com.teamlms.backend.domain.survey.entity.SurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.repository.SurveyTargetRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SurveyResponseService {

    private final SurveyTargetRepository targetRepository;
    private final AccountRepository accountRepository;
    // [추가]
    private final com.teamlms.backend.domain.survey.repository.SurveyRepository surveyRepository;

    public void submitResponse(Long userId, SurveySubmitRequest request) {
        // 학생 권한 체크
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (!"STUDENT".equals(user.getAccountType().name())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 대상자인지 확인
        SurveyTarget target = targetRepository.findBySurveyIdAndTargetAccountId(request.getSurveyId(), userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_TARGET));

        if (target.getStatus() == SurveyTargetStatus.SUBMITTED) {
            throw new BusinessException(ErrorCode.SURVEY_ALREADY_SUBMITTED);
        }

        // [추가] 기간 체크
        com.teamlms.backend.domain.survey.entity.Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND));

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (now.isBefore(survey.getStartAt()) || now.isAfter(survey.getEndAt())) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_OPEN);
        }

        target.submit(request.getResponses());
    }
}