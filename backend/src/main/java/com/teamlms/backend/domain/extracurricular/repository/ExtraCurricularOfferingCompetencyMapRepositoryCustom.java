package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraOfferingCompetencyMappingItem;


public interface ExtraCurricularOfferingCompetencyMapRepositoryCustom {
    List<ExtraOfferingCompetencyMappingItem> findOfferingCompetencyMapping(Long extraOfferingId);
}
