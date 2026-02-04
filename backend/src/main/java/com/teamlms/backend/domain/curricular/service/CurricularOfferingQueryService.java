package com.teamlms.backend.domain.curricular.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUserListItem;
import com.teamlms.backend.domain.curricular.api.dto.EnrollListItem;
import com.teamlms.backend.domain.curricular.api.dto.OfferingCompetencyMappingItem;
import com.teamlms.backend.domain.curricular.api.dto.OfferingStudentListItem;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingCompetencyMapRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.curricular.repository.EnrollmentRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CurricularOfferingQueryService {

    private final CurricularOfferingRepository curricularOfferingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CurricularOfferingCompetencyMapRepository curricularOfferingCompetencyMapRepository;

    // 목록 ( Admin )
    public Page<CurricularOfferingListItem> listForAdmin(
            Long semesterId,
            String keyword,
            Pageable pageable
    ) {
        return curricularOfferingRepository.findOfferingAdminList(semesterId, keyword, pageable);
    }

    //목록 ( User )
    public Page<CurricularOfferingUserListItem> listForUser(
            String keyword,
            Pageable pageable
    ) {
        return curricularOfferingRepository.findOfferingUserList(keyword, pageable);
    }

    // 상세 ( 기본 )
    public CurricularOfferingDetailResponse getDetail(Long offeringId) {
        return curricularOfferingRepository.findOfferingDetail(offeringId);
    }

    // 상세 ( 학생 )
    public Page<OfferingStudentListItem> listStudents(
            Long offeringId,
            String keyword,
            Pageable pageable
    ) {
        return enrollmentRepository.findStudentsByOffering(offeringId, keyword, pageable);
    }

    // 상세 ( 역량매핑)
    public List<OfferingCompetencyMappingItem> getMapping(Long offeringId) {

        if (!curricularOfferingRepository.existsById(offeringId)) {
            throw new BusinessException(
                ErrorCode.CURRICULAR_OFFERING_NOT_FOUND,
                offeringId
            );
        }

        List<OfferingCompetencyMappingItem> result =
                curricularOfferingCompetencyMapRepository.findOfferingCompetencyMapping(offeringId);
                
        return result;
    }
}
