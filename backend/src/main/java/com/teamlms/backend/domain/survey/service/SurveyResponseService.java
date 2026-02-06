package com.teamlms.backend.domain.survey.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.survey.api.dto.SurveySubmitRequest;
import com.teamlms.backend.domain.survey.entity.Survey;
import com.teamlms.backend.domain.survey.entity.SurveyTarget;
import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import com.teamlms.backend.domain.survey.repository.SurveyRepository;
import com.teamlms.backend.domain.survey.repository.SurveyTargetRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class SurveyResponseService {

    private final SurveyTargetRepository targetRepository;
    private final AccountRepository accountRepository;
    private final SurveyRepository surveyRepository;

    public void submitResponse(Long userId, SurveySubmitRequest request) {
        // 학생 권한 체크
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, userId));

        if (user.getAccountType() != AccountType.STUDENT) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 대상자인지 확인
        SurveyTarget target = targetRepository.findBySurveyIdAndTargetAccountId(request.surveyId(), userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_TARGET));

        if (target.getStatus() == SurveyTargetStatus.SUBMITTED) {
            throw new BusinessException(ErrorCode.SURVEY_ALREADY_SUBMITTED);
        }

        // [추가] 기간 체크
        Survey survey = surveyRepository.findById(request.surveyId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_NOT_FOUND, request.surveyId()));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(survey.getStartAt()) || now.isAfter(survey.getEndAt())) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_OPEN);
        }

        target.submit(request.responses());
    }
}