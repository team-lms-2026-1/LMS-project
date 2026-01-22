package com.teamlms.backend.domain.curricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.curricular.entity.CurricularOffering;

public interface CurricularOfferingRepository
        extends JpaRepository<CurricularOffering, Long>,
                CurricularOfferingRepositoryCustom {

    boolean existsByOfferingCode(String offeringCode);
}
