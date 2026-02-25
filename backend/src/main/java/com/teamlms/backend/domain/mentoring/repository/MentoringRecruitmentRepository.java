package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
     * 스케줄러용: DRAFT → OPEN
     * 모집 시작일이 됐고 아직 종료 전인 공고를 OPEN으로 일괄 변경
     */
    @Modifying
    @Query("UPDATE MentoringRecruitment r SET r.status = 'OPEN' " +
           "WHERE r.status = 'DRAFT' AND r.recruitStartAt <= :now AND r.recruitEndAt >= :now")
    int bulkOpenByDate(@Param("now") LocalDateTime now);

    /**
     * 스케줄러용: OPEN → CLOSED
     * 모집 종료일이 지난 OPEN 공고를 CLOSED로 일괄 변경
     */
    @Modifying
    @Query("UPDATE MentoringRecruitment r SET r.status = 'CLOSED' " +
           "WHERE r.status = 'OPEN' AND r.recruitEndAt < :now")
    int bulkCloseByDate(@Param("now") LocalDateTime now);
}

