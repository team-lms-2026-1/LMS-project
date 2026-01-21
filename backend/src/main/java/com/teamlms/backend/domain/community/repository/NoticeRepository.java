// package com.teamlms.backend.domain.community.repository;

// import com.teamlms.backend.domain.community.entity.Notice;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.jpa.repository.JpaRepository;

// public interface NoticeRepository extends JpaRepository<Notice, Long> {

//     // 페이징 처리를 위해 Pageable을 받는 findAll 메서드
//     // (Service의 getNoticeList에서 사용됨)
//     Page<Notice> findAll(Pageable pageable);
    
//     // 나중에 검색 기능이 필요하면 아래처럼 메서드를 추가할 수 있습니다.
//     // Page<Notice> findByTitleContainingOrContentContaining(String title, String content, Pageable pageable);
//     boolean existsByCategory_Id(Long categoryId);
// }
package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.Notice;
import com.teamlms.backend.domain.community.entity.NoticeCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    // 공지사항 목록 조회 (카테고리 필터 + 키워드 검색)
    @Query("SELECT n FROM Notice n " +
           "WHERE (:categoryId IS NULL OR n.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR n.title LIKE %:keyword% OR n.content LIKE %:keyword%)")
    Page<Notice> findNotices(@Param("categoryId") Long categoryId, 
                             @Param("keyword") String keyword, 
                             Pageable pageable);

    // 카테고리별 게시글 수 카운트
    long countByCategory(NoticeCategory category);
}