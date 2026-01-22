package com.teamlms.backend.domain.mentoring.batch;

import com.teamlms.backend.domain.mentoring.application.*;
import com.teamlms.backend.domain.mentoring.batch.dto.*;
import com.teamlms.backend.domain.mentoring.recruitment.*;
import com.teamlms.backend.domain.mentoring.recruitment.MentoringRecruitmentRepository;
import com.teamlms.backend.domain.mentoring.semester.*;
import com.teamlms.backend.global.error.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class MentoringBatchService {

    private final SemesterRepository semesterRepository;
    private final MentoringRecruitmentRepository recruitmentRepository;
    private final MentoringApplicationRepository applicationRepository;
    private final MentoringMatchingRepository matchingRepository;

    @Transactional(readOnly = true)
    public List<BatchSemesterItem> semesters() {
        return semesterRepository.findAll().stream()
                .map(s -> new BatchSemesterItem(s.getId(), s.getYear(), s.getTerm()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BatchRecruitmentItem> closedRecruitments(Long semesterId) {
        // CLOSED 만 (status= CLOSED)
        return recruitmentRepository.findAll().stream()
                .filter(r -> r.getSemester().getId().equals(semesterId))
                .filter(r -> r.getStatus() == RecruitmentStatus.CLOSED)
                .map(r -> new BatchRecruitmentItem(r.getId(), r.getTitle()))
                .toList();
    }

    @Transactional(readOnly = true)
    public BatchRecruitmentDetailResponse detail(Long recruitmentId) {
        MentoringRecruitment r = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BizException("RECRUITMENT_NOT_FOUND", "모집 정보를 찾을 수 없습니다."));

        // 승인된 멘토/멘티
        List<MentoringApplication> mentors = applicationRepository
                .findByRecruitment_IdAndRoleAndStatus(recruitmentId, ApplicationRole.MENTOR, ApplicationStatus.APPROVED);

        List<MentoringApplication> mentees = applicationRepository
                .findByRecruitment_IdAndRoleAndStatus(recruitmentId, ApplicationRole.MENTEE, ApplicationStatus.APPROVED);

        List<Map<String, Object>> mentorDtos = mentors.stream()
                .map(a -> Map.<String, Object>of(
                        "mentorApplicationId", a.getId(),
                        "accountId", a.getAccountId(),
                        "name", a.getName(),
                        "department", a.getDepartment()
                )).toList();

        List<Map<String, Object>> menteeDtos = mentees.stream()
                .map(a -> Map.<String, Object>of(
                        "menteeApplicationId", a.getId(),
                        "accountId", a.getAccountId(),
                        "name", a.getName(),
                        "department", a.getDepartment()
                )).toList();

        Map<String, Object> counts = Map.of(
                "mentorApproved", mentors.size(),
                "menteeApproved", mentees.size()
        );

        return new BatchRecruitmentDetailResponse(
                BatchRecruitmentDetailResponse.recruitmentInfo(
                        r.getId(),
                        r.getSemester().getId(),
                        r.getYear(),
                        r.getTerm(),
                        r.getTitle(),
                        r.getRecruitmentStartAt(),
                        r.getRecruitmentEndAt(),
                        r.getStatus().name()
                ),
                mentorDtos,
                menteeDtos,
                counts
        );
    }

    public void commit(Long recruitmentId, BatchCommitRequest req) {
        MentoringRecruitment r = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BizException("RECRUITMENT_NOT_FOUND", "모집 정보를 찾을 수 없습니다."));

        if (r.isBatchCommitted()) {
            throw new BizException("BATCH_ALREADY_COMMITTED", "이미 배치 확정된 모집입니다.");
        }

        if (req == null || req.assignments() == null || req.assignments().isEmpty()) {
            throw new BizException("ASSIGNMENTS_REQUIRED", "배치 assignments가 필요합니다.");
        }

        // 매칭 저장 + 신청 상태 MATCHED 처리
        for (BatchAssignmentItem item : req.assignments()) {
            MentoringApplication mentee = applicationRepository.findById(item.menteeApplicationId())
                    .orElseThrow(() -> new BizException("MENTEE_APP_NOT_FOUND", "멘티 신청을 찾을 수 없습니다."));
            MentoringApplication mentor = applicationRepository.findById(item.mentorApplicationId())
                    .orElseThrow(() -> new BizException("MENTOR_APP_NOT_FOUND", "멘토 신청을 찾을 수 없습니다."));

            if (!Objects.equals(mentee.getRecruitment().getId(), recruitmentId) ||
                !Objects.equals(mentor.getRecruitment().getId(), recruitmentId)) {
                throw new BizException("RECRUITMENT_MISMATCH", "배치 대상이 해당 모집에 속하지 않습니다.");
            }
            if (mentee.getRole() != ApplicationRole.MENTEE || mentor.getRole() != ApplicationRole.MENTOR) {
                throw new BizException("ROLE_MISMATCH", "멘토/멘티 역할이 올바르지 않습니다.");
            }
            if (mentee.getStatus() != ApplicationStatus.APPROVED || mentor.getStatus() != ApplicationStatus.APPROVED) {
                throw new BizException("NOT_APPROVED", "승인(APPROVED) 상태만 배치할 수 있습니다.");
            }

            matchingRepository.save(MentoringMatching.builder()
                    .recruitment(r)
                    .menteeApplication(mentee)
                    .mentorApplication(mentor)
                    .createdAt(LocalDateTime.now())
                    .build());

            mentee.markMatched();
            mentor.markMatched();
        }

        r.commitBatch(); // 모집 잠금
    }
}
