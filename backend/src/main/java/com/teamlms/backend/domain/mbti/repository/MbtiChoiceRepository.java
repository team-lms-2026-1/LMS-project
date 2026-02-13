package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MbtiChoiceRepository extends JpaRepository<MbtiChoice, Long> {

    @Query("SELECT c FROM MbtiChoice c WHERE c.question.questionId = :questionId ORDER BY c.choiceId ASC")
    List<MbtiChoice> findByQuestionIdOrderBySortOrder(@Param("questionId") Long questionId);

    @Query("SELECT c FROM MbtiChoice c WHERE c.question.questionId IN :questionIds ORDER BY c.question.questionId ASC, c.choiceId ASC")
    List<MbtiChoice> findByQuestionIdsOrderByQuestionAndChoiceId(@Param("questionIds") java.util.List<Long> questionIds);
}

