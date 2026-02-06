package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentoringQuestionRepository extends JpaRepository<MentoringQuestion, Long> {
    java.util.List<MentoringQuestion> findAllByMatchingId(Long matchingId);

    java.util.List<MentoringQuestion> findAllByMatchingIdIn(java.util.Collection<Long> matchingIds);
}
