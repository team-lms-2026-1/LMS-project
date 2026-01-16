package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // 페이징 처리를 위해 Pageable을 받는 findAll 메서드
    // (Service의 getNoticeList에서 사용됨)
    Page<Notice> findAll(Pageable pageable);
    
    // 나중에 검색 기능이 필요하면 아래처럼 메서드를 추가할 수 있습니다.
    // Page<Notice> findByTitleContainingOrContentContaining(String title, String content, Pageable pageable);
    boolean existsByCategory_Id(Long categoryId);
}