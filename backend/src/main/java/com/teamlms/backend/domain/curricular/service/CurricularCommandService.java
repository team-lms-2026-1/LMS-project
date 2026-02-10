package com.teamlms.backend.domain.curricular.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.api.dto.CurricularPatchRequest;
import com.teamlms.backend.domain.curricular.entity.Curricular;
import com.teamlms.backend.domain.curricular.repository.CurricularRepository;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CurricularCommandService {
    
    private final CurricularRepository curricularRepository;
    private final DeptRepository deptRepository;

    public void create(String curricularCode, String curricularName, Long deptId, Integer credits, String description) {
        // 1) 학과 존재 검증
        if (!deptRepository.existsById(deptId)) {
            throw new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId);
        }

        // 2) 교과목 코드 중복 검증
        if (curricularRepository.existsByCurricularCode(curricularCode)) {
            throw new BusinessException(ErrorCode.CURRICULAR_CODE_ALREADY_EXISTS, curricularCode);
        }

        Curricular curricular = Curricular.builder()
                .curricularCode(curricularCode)
                .curricularName(curricularName)
                .deptId(deptId)
                .credits(credits)
                .description(description)
                .isActive(true)
                .build();
        
        curricularRepository.save(curricular);
    }

    @Transactional
    public void patch(Long curricularId, CurricularPatchRequest req) {

        Curricular c = curricularRepository.findById(curricularId)
            .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_NOT_FOUND, curricularId));

        Long nextDeptId = (req.deptId() != null) ? req.deptId() : c.getDeptId();
        Integer nextCredits = (req.credits() != null) ? req.credits() : c.getCredits();

        // 검증
        if (!deptRepository.existsById(nextDeptId)) {
            throw new BusinessException(ErrorCode.DEPT_NOT_FOUND, nextDeptId);
        }

        if (nextCredits < 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "credits must be non-negative");
        }

        // 수정
        c.patch(
            req.curricularName(),
            req.deptId(),
            req.credits(),
            req.description(),
            req.isActive()
        );
    }

}
