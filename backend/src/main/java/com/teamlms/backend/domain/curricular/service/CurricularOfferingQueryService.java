package com.teamlms.backend.domain.curricular.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingDetailResponse;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingListItem;
import com.teamlms.backend.domain.curricular.api.dto.CurricularOfferingUserListItem;
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

    public Page<CurricularOfferingListItem> listForAdmin(
            Long semesterId,
            String keyword,
            Pageable pageable
    ) {
        return curricularOfferingRepository.findOfferingAdminList(semesterId, keyword, pageable);
    }

    public Page<CurricularOfferingListItem> listForProfessor(
            Long professorAccountId,
            Long semesterId,
            String keyword,
            Pageable pageable
    ) {
        return curricularOfferingRepository.findOfferingProfessorList(professorAccountId, semesterId, keyword, pageable);
    }

    public Page<CurricularOfferingUserListItem> listForUser(
            String keyword,
            Long professorAccountId,
            Pageable pageable
    ) {
        return curricularOfferingRepository.findOfferingUserList(keyword, professorAccountId, pageable);
    }

    public CurricularOfferingDetailResponse getDetail(Long offeringId) {
        return curricularOfferingRepository.findOfferingDetail(offeringId);
    }

    public CurricularOfferingDetailResponse getDetailForProfessor(
            Long professorAccountId,
            Long offeringId
    ) {
        assertProfessorOwnsOffering(offeringId, professorAccountId);
        return getDetail(offeringId);
    }

    public Page<OfferingStudentListItem> listStudents(
            Long offeringId,
            String keyword,
            Pageable pageable
    ) {
        return enrollmentRepository.findStudentsByOffering(offeringId, keyword, pageable);
    }

    public Page<OfferingStudentListItem> listStudentsForProfessor(
            Long professorAccountId,
            Long offeringId,
            String keyword,
            Pageable pageable
    ) {
        assertProfessorOwnsOffering(offeringId, professorAccountId);
        return listStudents(offeringId, keyword, pageable);
    }

    public List<OfferingCompetencyMappingItem> getMapping(Long offeringId) {
        if (!curricularOfferingRepository.existsById(offeringId)) {
            throw new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId);
        }

        return curricularOfferingCompetencyMapRepository.findOfferingCompetencyMapping(offeringId);
    }

    public List<OfferingCompetencyMappingItem> getMappingForProfessor(
            Long professorAccountId,
            Long offeringId
    ) {
        assertProfessorOwnsOffering(offeringId, professorAccountId);
        return getMapping(offeringId);
    }

    private void assertProfessorOwnsOffering(Long offeringId, Long professorAccountId) {
        if (!curricularOfferingRepository.existsByOfferingIdAndProfessorAccountId(offeringId, professorAccountId)) {
            throw new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId);
        }
    }
}
