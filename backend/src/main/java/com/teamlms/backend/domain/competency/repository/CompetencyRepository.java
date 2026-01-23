package com.teamlms.backend.domain.competency.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.competency.entitiy.Competency;

public interface CompetencyRepository extends JpaRepository<Competency, Long> {

}

