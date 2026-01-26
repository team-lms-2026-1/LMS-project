package com.teamlms.backend.domain.extracurricular.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularListItem;
import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularPatchForm;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ExtraCurricularQueryService {
    
    private final ExtraCurricularRepository extraCurricularRepository;

    // 비교과 수정 조회
    public ExtraCurricularPatchForm editForm(Long extraCurricularId) {

        ExtraCurricular extraCurricular = extraCurricularRepository.findById(extraCurricularId) 
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_NOT_FOUND, extraCurricularId)); 
        return ExtraCurricularPatchForm.from(extraCurricular);
    }

    public Page<ExtraCurricularListItem> list(String keyword, Pageable pageable) {
        return extraCurricularRepository.findList(keyword, pageable);
    }
}
