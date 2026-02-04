package com.teamlms.backend.domain.curricular.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.curricular.entity.CurricularOfferingCompetencyMap;
import com.teamlms.backend.domain.curricular.entity.CurricularOfferingCompetencyMapId;

public interface CurricularOfferingCompetencyMapRepository
    extends JpaRepository<CurricularOfferingCompetencyMap, CurricularOfferingCompetencyMapId>,
    CurricularOfferingCompetencyMapRepositoryCustom {

  List<CurricularOfferingCompetencyMap> findAllByIdOfferingId(Long offeringId);

  void deleteAllByIdOfferingId(Long offeringId);

  long countByIdOfferingId(Long offeringId);

  // weight 1~6이 모두 존재하는지 체크용
  @Query("""
          select count(distinct m.weight)
          from CurricularOfferingCompetencyMap m
          where m.id.offeringId = :offeringId
            and m.weight between 1 and 6
      """)
  long countDistinctWeight1to6(@Param("offeringId") Long offeringId);

  Optional<CurricularOfferingCompetencyMap> findByIdOfferingIdAndWeight(Long offeringId, Integer weight);

  Optional<CurricularOfferingCompetencyMap> findByIdOfferingIdAndIdCompetencyId(Long offeringId, Long competencyId);

  void deleteByIdOfferingId(Long offeringId);
}