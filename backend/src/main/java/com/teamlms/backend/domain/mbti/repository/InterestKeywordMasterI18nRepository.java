package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.InterestKeywordMasterI18n;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InterestKeywordMasterI18nRepository extends JpaRepository<InterestKeywordMasterI18n, Long> {
    @Query("SELECT k FROM InterestKeywordMasterI18n k WHERE k.interestKeywordMaster.id = :keywordId AND k.locale = :locale")
    Optional<InterestKeywordMasterI18n> findByInterestKeywordMasterIdAndLocale(@Param("keywordId") Long keywordId, @Param("locale") String locale);
}
