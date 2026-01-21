package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.QnaQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QnaQuestionRepository extends JpaRepository<QnaQuestion, Long> {

    @Query("SELECT q FROM QnaQuestion q " +
           "JOIN FETCH q.category " +
           "JOIN FETCH q.author " +
           "LEFT JOIN FETCH q.answer " +
           "WHERE (:categoryId IS NULL OR q.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR q.title LIKE %:keyword% OR q.content LIKE %:keyword%)")
    Page<QnaQuestion> findBySearchCondition(
            @Param("categoryId") Long categoryId, 
            @Param("keyword") String keyword, 
            Pageable pageable
    );
    
    boolean existsByCategory_Id(Long categoryId);
}