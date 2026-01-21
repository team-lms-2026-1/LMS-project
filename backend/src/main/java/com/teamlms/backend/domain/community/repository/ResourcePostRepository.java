package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.ResourcePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResourcePostRepository extends JpaRepository<ResourcePost, Long> {

    // 1. 목록 조회 (동적 쿼리: 카테고리 필터 + 제목/내용 검색)
    // - categoryId가 null이면 전체 조회, 값이 있으면 해당 카테고리만 조회
    // - keyword가 null이면 전체 조회, 값이 있으면 제목이나 내용에 포함된 것 조회
    @Query("SELECT r FROM ResourcePost r " +
           "WHERE (:categoryId IS NULL OR r.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR r.title LIKE %:keyword% OR r.content LIKE %:keyword%)")
    Page<ResourcePost> findBySearchCondition(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    // 2. 카테고리 삭제 전 사용 여부 확인
    // (해당 카테고리를 사용하는 게시글이 하나라도 있으면 true 반환)
    boolean existsByCategory_Id(Long categoryId);
}