package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.FaqCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FaqCategoryRepository extends JpaRepository<FaqCategory, Long> {
    Optional<FaqCategory> findByName(String name);
    Page<FaqCategory> findByNameContaining(String keyword, Pageable pageable);
}