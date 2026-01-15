package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.ProfessorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorProfileRepository extends JpaRepository<ProfessorProfile, Long> {
    boolean existsByProfessorNo(String professorNo);
}
