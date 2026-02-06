package com.teamlms.backend.domain.extracurricular.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularSessionVideo;

public interface ExtraCurricularSessionVideoRepository extends JpaRepository<ExtraCurricularSessionVideo, Long> {

    boolean existsByStorageKey(String storageKey);

    Optional<ExtraCurricularSessionVideo> findBySessionId(Long sessionId);
}
