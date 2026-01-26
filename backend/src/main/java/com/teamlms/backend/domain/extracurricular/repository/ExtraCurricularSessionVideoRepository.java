package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionVideo;

public interface ExtraCurricularSessionVideoRepository extends JpaRepository<ExtraCurricularSessionVideo, Long> {
    
}
