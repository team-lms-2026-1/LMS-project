package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MbtiResultRepository extends JpaRepository<MbtiResult, Long> {
    List<MbtiResult> findByAccountIdOrderByCreatedAtDesc(Long accountId);

    Optional<MbtiResult> findTopByAccountIdOrderByCreatedAtDesc(Long accountId);
}
