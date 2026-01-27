package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularApplication;

public interface ExtraCurricularApplicationRepository extends JpaRepository<ExtraCurricularApplication, Long> {
    
}
