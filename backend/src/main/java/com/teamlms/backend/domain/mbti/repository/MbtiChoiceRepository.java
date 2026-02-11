package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MbtiChoiceRepository extends JpaRepository<MbtiChoice, Long> {
}
