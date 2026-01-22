package com.teamlms.backend.domain.mentoring.recruitment;

import com.teamlms.backend.domain.mentoring.recruitment.dto.*;
import com.teamlms.backend.domain.mentoring.semester.SemesterRepository;
import com.teamlms.backend.global.error.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class MentoringRecruitmentService {

    private final MentoringRecruitmentRepository recruitmentRepository;
    private final SemesterRepository semesterRepository;

    @Transactional(readOnly = true)
    public Page<RecruitmentListItem> list(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<MentoringRecruitment> p =
                (keyword == null || keyword.isBlank())
                        ? recruitmentRepository.findAll(pageable)
                        : recruitmentRepository.findByTitleContainingIgnoreCase(keyword, pageable);

        return p.map(r -> new RecruitmentListItem(
                r.getId(),
                r.getSemester().getId(),
                r.getYear(),
                r.getTerm(),
                r.getTitle(),
                r.getRecruitmentStartAt(),
                r.getRecruitmentEndAt(),
                r.getStatus(),
                r.getCreatedAt()
        ));
    }

    @Transactional(readOnly = true)
    public RecruitmentDetailResponse detail(Long recruitmentId) {
        MentoringRecruitment r = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BizException("RECRUITMENT_NOT_FOUND", "모집 정보를 찾을 수 없습니다."));
        return new RecruitmentDetailResponse(
                r.getTitle(),
                r.getDescription(),
                r.getRecruitmentStartAt(),
                r.getRecruitmentEndAt()
        );
    }

    public void create(RecruitmentCreateRequest req) {
        var semester = semesterRepository.findById(req.semesterId())
                .orElseThrow(() -> new BizException("SEMESTER_NOT_FOUND", "학기 정보를 찾을 수 없습니다."));

        MentoringRecruitment entity = MentoringRecruitment.builder()
                .semester(semester)
                .year(req.year())
                .term(req.term())
                .title(req.title())
                .description(req.description())
                .recruitmentStartAt(req.recruitmentStartAt())
                .recruitmentEndAt(req.recruitmentEndAt())
                .status(RecruitmentStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        recruitmentRepository.save(entity);
    }

    public void update(Long recruitmentId, RecruitmentUpdateRequest req) {
        MentoringRecruitment r = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BizException("RECRUITMENT_NOT_FOUND", "모집 정보를 찾을 수 없습니다."));
        r.update(req.title(), req.description(), req.recruitmentStartAt(), req.recruitmentEndAt());
    }

    public void delete(Long recruitmentId) {
        if (!recruitmentRepository.existsById(recruitmentId)) {
            throw new BizException("RECRUITMENT_NOT_FOUND", "모집 정보를 찾을 수 없습니다.");
        }
        recruitmentRepository.deleteById(recruitmentId);
    }
}
