package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;

public interface ExtraCurricularOfferingRepository extends JpaRepository<ExtraCurricularOffering, Long>{
    
}
