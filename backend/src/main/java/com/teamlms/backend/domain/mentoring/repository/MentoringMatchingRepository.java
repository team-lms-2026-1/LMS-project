package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringMatching;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentoringMatchingRepository extends JpaRepository<MentoringMatching, Long> {
    java.util.List<MentoringMatching> findAllByRecruitmentId(Long recruitmentId);

    java.util.List<MentoringMatching> findAllByMentorApplicationIdInOrMenteeApplicationIdIn(
            java.util.Collection<Long> mentorAppIds, java.util.Collection<Long> menteeAppIds);
}
