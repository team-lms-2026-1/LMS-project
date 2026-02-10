package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOfferingCompetencyMap;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOfferingCompetencyMapId;


public interface ExtraCurricularOfferingCompetencyMapRepository
        extends JpaRepository<ExtraCurricularOfferingCompetencyMap, ExtraCurricularOfferingCompetencyMapId>, ExtraCurricularOfferingCompetencyMapRepositoryCustom {

    List<ExtraCurricularOfferingCompetencyMap> findAllByIdExtraOfferingId(Long extraOfferingId);

    void deleteAllByIdExtraOfferingId(Long extraOfferingId);

    long countByIdExtraOfferingId(Long extraOfferingId);

    // weight 1~6이 모두 존재하는지 체크용 (교과와 동일 컨셉)
    @Query("""
        select count(distinct m.weight)
        from ExtraCurricularOfferingCompetencyMap m
        where m.id.extraOfferingId = :extraOfferingId
          and m.weight between 1 and 6
    """)
    long countDistinctWeight1to6(@Param("extraOfferingId") Long extraOfferingId);

    Optional<ExtraCurricularOfferingCompetencyMap> findByIdExtraOfferingIdAndWeight(Long extraOfferingId, Integer weight);

    Optional<ExtraCurricularOfferingCompetencyMap> findByIdExtraOfferingIdAndIdCompetencyId(Long extraOfferingId, Long competencyId);

    void deleteByIdExtraOfferingId(Long extraOfferingId);
    
}

