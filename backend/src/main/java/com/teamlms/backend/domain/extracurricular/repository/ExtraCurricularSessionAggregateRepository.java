package com.teamlms.backend.domain.extracurricular.repository;

public interface ExtraCurricularSessionAggregateRepository {
    Long sumRewardPointByOfferingId(Long extraOfferingId);
    Long sumRecognizedHoursByOfferingId(Long extraOfferingId);
}
