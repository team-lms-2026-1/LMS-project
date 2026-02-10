package com.teamlms.backend.domain.mypage.repository;

import com.teamlms.backend.domain.mypage.entity.StudentMypageSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentMypageSummaryRepository extends JpaRepository<StudentMypageSummary, Long> {
    // account_id로 조회
    Optional<StudentMypageSummary> findByAccountId(Long accountId);

    // 학번으로 조회
    Optional<StudentMypageSummary> findByStudentNo(String studentNo);
}
