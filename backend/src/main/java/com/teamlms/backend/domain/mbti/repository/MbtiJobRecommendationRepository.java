package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.MbtiJobRecommendation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MbtiJobRecommendationRepository extends JpaRepository<MbtiJobRecommendation, Long> {

    @EntityGraph(attributePaths = "items")
    Optional<MbtiJobRecommendation> findByAccountId(Long accountId);

    void deleteByAccountId(Long accountId);
}
