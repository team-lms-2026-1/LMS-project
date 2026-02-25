package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface SurveyRepository extends JpaRepository<Survey, Long>, JpaSpecificationExecutor<Survey>, SurveyRepositoryCustom {

    /**
     * 스케줄러용: DRAFT → OPEN
     * 시작일이 됐고 아직 종료 전인 설문을 OPEN으로 일괄 변경
     */
    @Modifying
    @Query("UPDATE Survey s SET s.status = 'OPEN' " +
           "WHERE s.status = 'DRAFT' AND s.startAt <= :now AND s.endAt >= :now")
    int bulkOpenByDate(@Param("now") LocalDateTime now);

    /**
     * 스케줄러용: OPEN → CLOSED
     * 종료일이 지난 OPEN 설문을 CLOSED로 일괄 변경
     */
    @Modifying
    @Query("UPDATE Survey s SET s.status = 'CLOSED' " +
           "WHERE s.status = 'OPEN' AND s.endAt < :now")
    int bulkCloseByDate(@Param("now") LocalDateTime now);
}
