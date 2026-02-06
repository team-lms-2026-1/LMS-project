package com.teamlms.backend.domain.study_rental.repository;

import com.teamlms.backend.domain.study_rental.dto.SpaceSearchCondition;
import com.teamlms.backend.domain.study_rental.entity.StudySpace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudySpaceRepository extends JpaRepository<StudySpace, Long> {
    boolean existsBySpaceName(String spaceName);

    /**
     * 학습공간 검색
     */
    @Query("SELECT s FROM StudySpace s " +
            "WHERE (:#{#cond.keyword} IS NULL OR s.spaceName LIKE %:#{#cond.keyword}% OR s.location LIKE %:#{#cond.keyword}%) "
            +
            "AND (:#{#cond.isActiveOnly} = true AND s.isActive = true OR :#{#cond.isActiveOnly} IS NULL OR :#{#cond.isActiveOnly} = false)")
    Page<StudySpace> search(@Param("cond") SpaceSearchCondition cond, Pageable pageable);
}