package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.Faq;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    // 동적 검색 쿼리
    @Query("SELECT f FROM Faq f " +
           "WHERE (:categoryId IS NULL OR f.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.content LIKE %:keyword%)")
    Page<Faq> findBySearchCondition(@Param("categoryId") Long categoryId, 
                                    @Param("keyword") String keyword, 
                                    Pageable pageable);

    boolean existsByCategory_Id(Long categoryId);
}