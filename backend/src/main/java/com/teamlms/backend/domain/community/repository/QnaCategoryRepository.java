package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.QnaCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface QnaCategoryRepository extends JpaRepository<QnaCategory, Long> {
    Optional<QnaCategory> findByName(String name);
    Page<QnaCategory> findByNameContaining(String keyword, Pageable pageable);
}