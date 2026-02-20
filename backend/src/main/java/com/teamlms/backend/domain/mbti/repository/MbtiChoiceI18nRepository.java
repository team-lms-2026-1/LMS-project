package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.MbtiChoiceI18n;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MbtiChoiceI18nRepository extends JpaRepository<MbtiChoiceI18n, Long> {
    @Query("SELECT c FROM MbtiChoiceI18n c WHERE c.choice.choiceId = :choiceId AND c.locale = :locale")
    Optional<MbtiChoiceI18n> findByChoiceIdAndLocale(@Param("choiceId") Long choiceId, @Param("locale") String locale);
}
