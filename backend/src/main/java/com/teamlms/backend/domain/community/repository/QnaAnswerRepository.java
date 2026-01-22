package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.QnaAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QnaAnswerRepository extends JpaRepository<QnaAnswer, Long> {
}