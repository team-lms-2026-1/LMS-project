package com.teamlms.backend.domain.curricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.api.dto.CurricularEditResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularListItem;
import com.teamlms.backend.domain.curricular.entity.Curricular;
import com.teamlms.backend.domain.curricular.repository.CurricularRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CurricularQueryService {

    private final CurricularRepository curricularRepository;

    // 교과 수정 조회
    public CurricularEditResponse getForUpdate(Long curricularId) {
        
        Curricular curricular = curricularRepository.findById(curricularId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_NOT_FOUND, curricularId));
        return CurricularEditResponse.from(curricular);
    }

    // 교과 목록 조회
    public Page<CurricularListItem> list(String keyword, Pageable pageable) {
        return curricularRepository.findList(keyword, pageable);
    }

}
