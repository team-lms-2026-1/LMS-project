package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MentoringRecruitmentRepository extends JpaRepository<MentoringRecruitment, Long> {
    Page<MentoringRecruitment> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
    Page<MentoringRecruitment> findByStatus(MentoringRecruitmentStatus status, Pageable pageable);
    Page<MentoringRecruitment> findByStatusAndTitleContainingIgnoreCase(MentoringRecruitmentStatus status, String keyword, Pageable pageable);
    boolean existsBySemesterId(Long semesterId);

    /**
     * OPEN 상태이면서 현재 모집 기간 내 공고 조회 (날짜 기반 동적 필터)
     * 스케줄러 없이 조회 시점에 날짜로 계산
     */
    @Query("SELECT r FROM MentoringRecruitment r " +
           "WHERE r.status = :status AND r.recruitStartAt <= :now AND r.recruitEndAt >= :now")
    Page<MentoringRecruitment> findByStatusAndWithinDateRange(
            @Param("status") MentoringRecruitmentStatus status,
            @Param("now") LocalDateTime now,
            Pageable pageable);

    @Query("SELECT r FROM MentoringRecruitment r " +
           "WHERE r.status = :status AND r.recruitStartAt <= :now AND r.recruitEndAt >= :now " +
           "AND LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<MentoringRecruitment> findByStatusAndWithinDateRangeAndTitleContaining(
            @Param("status") MentoringRecruitmentStatus status,
            @Param("now") LocalDateTime now,
            @Param("keyword") String keyword,
            Pageable pageable);
}

