package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSession;

public interface ExtraCurricularSessionRepository extends JpaRepository<ExtraCurricularSession, Long> {
    
}
