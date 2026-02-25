package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.Notice;
import com.teamlms.backend.domain.community.entity.NoticeCategory;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    // 1. 공지사항 목록 조회 (카테고리 필터 + 키워드 검색)
    @Query("SELECT n FROM Notice n " +
           "WHERE (:categoryId IS NULL OR n.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR n.title LIKE %:keyword% OR n.content LIKE %:keyword%)")
    Page<Notice> findNotices(@Param("categoryId") Long categoryId, 
                             @Param("keyword") String keyword, 
                             Pageable pageable);

    // 학생용: 게기기간 내 공지사항만 조회
    @Query("SELECT n FROM Notice n " +
           "WHERE (:categoryId IS NULL OR n.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR n.title LIKE %:keyword% OR n.content LIKE %:keyword%) " +
           "AND (n.displayStartAt IS NULL OR n.displayStartAt <= :endOfDay) " +
           "AND (n.displayEndAt IS NULL OR n.displayEndAt >= :startOfDay)")
    Page<Notice> findVisibleNotices(@Param("categoryId") Long categoryId,
                                    @Param("keyword") String keyword,
                                    @Param("startOfDay") LocalDateTime startOfDay,
                                    @Param("endOfDay") LocalDateTime endOfDay,
                                    Pageable pageable);

    // 2. 카테고리별 게시글 수 카운트 (목록 조회 시 사용)
    long countByCategory(NoticeCategory category);

    // 3. 카테고리 삭제 전 무결성 검증을 위한 메서드
    boolean existsByCategory_Id(Long categoryId);
}
