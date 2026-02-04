package com.teamlms.backend.domain.mentoring.service;

import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentResponse;
import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import com.teamlms.backend.domain.mentoring.repository.MentoringRecruitmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentoringQueryService {

    private final MentoringRecruitmentRepository recruitmentRepository;

    public Page<MentoringRecruitmentResponse> getRecruitments(Pageable pageable) {
        return recruitmentRepository.findAll(pageable)
                .map(MentoringRecruitmentResponse::from);
    }

    public MentoringRecruitmentResponse getRecruitment(Long id) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mentoring recruitment not found"));
        return MentoringRecruitmentResponse.from(recruitment);
    }
}
