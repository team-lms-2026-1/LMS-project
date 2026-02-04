package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentoringApplicationRepository extends JpaRepository<MentoringApplication, Long> {
    List<MentoringApplication> findAllByRecruitmentId(Long recruitmentId);

    List<MentoringApplication> findAllByAccountId(Long accountId);

    void deleteAllByRecruitmentId(Long recruitmentId);

    boolean existsByRecruitmentIdAndAccountIdAndRole(Long recruitmentId, Long accountId,
            com.teamlms.backend.domain.mentoring.enums.MentoringRole role);
}
