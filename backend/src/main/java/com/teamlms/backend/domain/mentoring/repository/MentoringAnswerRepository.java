package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentoringAnswerRepository extends JpaRepository<MentoringAnswer, Long> {
    java.util.List<MentoringAnswer> findAllByQuestionIdIn(java.util.Collection<Long> questionIds);

    void deleteAllByQuestionIdIn(java.util.Collection<Long> questionIds);
}
