package com.teamlms.backend.domain.curricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.curricular.entity.CurricularOffering;

public interface CurricularOfferingRepository
        extends JpaRepository<CurricularOffering, Long>,
                CurricularOfferingRepositoryCustom {

    boolean existsByOfferingCode(String offeringCode);
    boolean existsByCurricularId(Long curricularId);
    
    // 같은 학기에 같은 교과 중복 개설 방지
    boolean existsByCurricularIdAndSemesterId(Long curricularId, Long semesterId);

    boolean existsByOfferingIdAndProfessorAccountId(Long offeringId, Long professorAccountId);
}
