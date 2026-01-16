package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.NoticeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface NoticeCategoryRepository extends JpaRepository<NoticeCategory, Long> {

    // 이름 중복 검사 및 조회를 위한 메서드
    Optional<NoticeCategory> findByName(String name);

    // 추가: 검색 기능 (이름에 키워드가 포함된 경우 페이징 조회)
    Page<NoticeCategory> findByNameContaining(String keyword, Pageable pageable);
}