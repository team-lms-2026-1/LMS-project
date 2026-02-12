package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface InterestKeywordMasterRepository extends JpaRepository<InterestKeywordMaster, Long> {

    List<InterestKeywordMaster> findByActiveTrueOrderBySortOrderAsc();

    List<InterestKeywordMaster> findByIdInAndActiveTrue(Collection<Long> ids);
}
