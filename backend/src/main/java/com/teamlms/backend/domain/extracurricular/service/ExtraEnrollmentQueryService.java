package com.teamlms.backend.domain.extracurricular.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraEnrollmentListItem;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExtraEnrollmentQueryService {

    private final ExtraCurricularApplicationRepository applicationRepository;

    public Page<StudentExtraEnrollmentListItem> listEnrollments(
        Long studentAccountId,
        Pageable pageable
    ) {
        return applicationRepository.findStudentEnrollments(studentAccountId, pageable);
    }

    public Page<StudentExtraEnrollmentListItem> listCurrentEnrollments(
        Long studentAccountId,
        Pageable pageable
    ) {
        return applicationRepository.findStudentCurrentEnrollments(studentAccountId, pageable);
    }
}
