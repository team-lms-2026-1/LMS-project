package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularCompetencyMap;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularCompetencyMapId;
import java.util.Optional;

public interface ExtraCurricularCompetencyMapRepository
        extends JpaRepository<ExtraCurricularCompetencyMap, ExtraCurricularCompetencyMapId> {

    Optional<ExtraCurricularCompetencyMap> findByIdExtraCurricularIdAndIdCompetencyId(Long extraCurricularId,
            Long competencyId);
}
