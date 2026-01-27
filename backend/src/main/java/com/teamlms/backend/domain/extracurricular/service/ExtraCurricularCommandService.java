package com.teamlms.backend.domain.extracurricular.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularPatchRequest;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ExtraCurricularCommandService {
    
    private final ExtraCurricularRepository extraCurricularRepository;

    // 생성
    public void create(
        String extraCurricularCode,
        String extraCurricularName,
        String description,
        String hostOrgName
    ) {
        // 비교과 코드 중복 검증
        if (extraCurricularRepository.existsByExtraCurricularCode(extraCurricularCode)) {
            throw new BusinessException(ErrorCode.EXTRA_CURRICULAR_CODE_ALREADY_EXISTS, extraCurricularCode);
        }

        ExtraCurricular extraCurricular = ExtraCurricular.builder()
                        .extraCurricularCode(extraCurricularCode)
                        .extraCurricularName(extraCurricularName)
                        .description(description)
                        .hostOrgName(hostOrgName)
                        .isActive(true)
                        .build();
        
        extraCurricularRepository.save(extraCurricular);
    }

    // 수정
    public void patch( Long extraCurricularId, ExtraCurricularPatchRequest req ){

        ExtraCurricular e = extraCurricularRepository.findById(extraCurricularId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_NOT_FOUND, extraCurricularId));

        e.patch(
            req.extraCurricularName(),
            req.description(),
            req.hostOrgName(),
            req.isActive()
        );
    }
}
