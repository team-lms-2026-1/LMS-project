package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MbtiQuestionRepository extends JpaRepository<MbtiQuestion, Long> {

    @Query("SELECT q FROM MbtiQuestion q JOIN FETCH q.choices ORDER BY q.sortOrder ASC")
    List<MbtiQuestion> findAllWithChoices();
}
