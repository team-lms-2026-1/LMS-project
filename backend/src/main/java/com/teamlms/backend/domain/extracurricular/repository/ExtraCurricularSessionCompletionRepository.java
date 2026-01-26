package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionCompletion;

public interface ExtraCurricularSessionCompletionRepository extends JpaRepository<ExtraCurricularSessionCompletion, Long> {
    
}
