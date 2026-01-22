package com.teamlms.backend.domain.mentoring.application;

import com.teamlms.backend.domain.mentoring.application.dto.*;
import com.teamlms.backend.global.error.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class MentoringApplicationService {

    private final MentoringApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public Page<ApplicationListItem> list(Long recruitmentId,
                                         ApplicationRole role,
                                         ApplicationStatus status,
                                         String keyword,
                                         int page,
                                         int size) {

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        return applicationRepository.search(recruitmentId, role, status, keyword, pageable)
                .map(a -> new ApplicationListItem(
                        a.getId(),
                        a.getRecruitment().getId(),
                        a.getRole(),
                        Map.of(
                                "accountId", a.getAccountId(),
                                "name", a.getName(),
                                "department", a.getDepartment(),
                                "grade", a.getGrade()
                        ),
                        a.getStatus(),
                        a.getAppliedAt(),
                        a.getProcessedAt()
                ));
    }

    @Transactional(readOnly = true)
    public Object stats(Long recruitmentId) {
        // 스펙 형태: meta.stats -> { MENTEE:{total,applied,approved,rejected,canceled,matched}, MENTOR:{...} }
        return Map.of(
                "MENTEE", roleStats(recruitmentId, ApplicationRole.MENTEE),
                "MENTOR", roleStats(recruitmentId, ApplicationRole.MENTOR)
        );
    }

    private Map<String, Object> roleStats(Long recruitmentId, ApplicationRole role) {
        return Map.of(
                "total", applicationRepository.countByRecruitment_IdAndRole(recruitmentId, role),
                "applied", applicationRepository.countByRecruitment_IdAndRoleAndStatus(recruitmentId, role, ApplicationStatus.APPLIED),
                "approved", applicationRepository.countByRecruitment_IdAndRoleAndStatus(recruitmentId, role, ApplicationStatus.APPROVED),
                "rejected", applicationRepository.countByRecruitment_IdAndRoleAndStatus(recruitmentId, role, ApplicationStatus.REJECTED),
                "canceled", applicationRepository.countByRecruitment_IdAndRoleAndStatus(recruitmentId, role, ApplicationStatus.CANCELED),
                "matched", applicationRepository.countByRecruitment_IdAndRoleAndStatus(recruitmentId, role, ApplicationStatus.MATCHED)
        );
    }

    public void approve(Long applicationId) {
        MentoringApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BizException("APPLICATION_NOT_FOUND", "신청 정보를 찾을 수 없습니다."));
        app.approve();
    }

    public void reject(Long applicationId, String reason) {
        MentoringApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BizException("APPLICATION_NOT_FOUND", "신청 정보를 찾을 수 없습니다."));
        if (reason == null || reason.isBlank()) {
            throw new BizException("REJECT_REASON_REQUIRED", "반려 사유가 필요합니다.");
        }
        app.reject(reason);
    }
}
