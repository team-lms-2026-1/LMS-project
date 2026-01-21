package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.ResourceCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResourceCategoryRepository extends JpaRepository<ResourceCategory, Long> {

    // 1. 이름 중복 검사 (등록/수정 시 사용)
    Optional<ResourceCategory> findByName(String name);

    // 2. 카테고리 목록 검색 (이름에 키워드 포함)
    Page<ResourceCategory> findByNameContaining(String keyword, Pageable pageable);
}