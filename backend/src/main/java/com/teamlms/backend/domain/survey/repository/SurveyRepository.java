package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SurveyRepository extends JpaRepository<Survey, Long>, JpaSpecificationExecutor<Survey> {
    @Query("SELECT s FROM Survey s WHERE s.id IN :ids AND LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY s.id DESC")
    List<Survey> findByIdInAndTitleContaining(@Param("ids") List<Long> ids, @Param("keyword") String keyword);

    List<Survey> findAllByIdInOrderByIdDesc(List<Long> ids);
}