package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.MbtiQuestionI18n;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MbtiQuestionI18nRepository extends JpaRepository<MbtiQuestionI18n, Long> {
    @Query("SELECT q FROM MbtiQuestionI18n q WHERE q.question.questionId = :questionId AND q.locale = :locale")
    Optional<MbtiQuestionI18n> findByQuestionIdAndLocale(@Param("questionId") Long questionId, @Param("locale") String locale);
}
