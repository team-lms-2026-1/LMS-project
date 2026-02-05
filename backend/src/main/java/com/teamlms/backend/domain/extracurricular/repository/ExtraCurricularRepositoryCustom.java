package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;

public interface ExtraCurricularRepositoryCustom {
    
    List<ExtraCurricular> findActiveForDropdown();
}
