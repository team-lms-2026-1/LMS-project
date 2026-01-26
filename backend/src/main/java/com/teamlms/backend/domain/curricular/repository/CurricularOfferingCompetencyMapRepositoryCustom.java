package com.teamlms.backend.domain.curricular.repository;

import java.util.List;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem;

public interface CurricularOfferingCompetencyMapRepositoryCustom {
    List<OfferingCompetencyMappingItem> findOfferingCompetencyMapping(Long offeringId);
}
