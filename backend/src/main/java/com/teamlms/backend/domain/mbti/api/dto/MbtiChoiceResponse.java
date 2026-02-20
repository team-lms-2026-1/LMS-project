package com.teamlms.backend.domain.mbti.api.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import com.teamlms.backend.domain.mbti.service.MbtiI18nService;

public record MbtiChoiceResponse(
        Long choiceId,
        String content
) {
    public static MbtiChoiceResponse from(MbtiChoice choice) {
        return new MbtiChoiceResponse(choice.getChoiceId(), choice.getContent());
    }

    /**
     * 다국어 지원 버전 - locale에 맞는 내용 반환
     */
    public static MbtiChoiceResponse fromWithI18n(
            MbtiChoice choice,
            String locale,
            MbtiI18nService i18nService) {
        return new MbtiChoiceResponse(
                choice.getChoiceId(),
                i18nService.getChoiceContent(choice, locale)
        );
    }
}
