package com.teamlms.backend.domain.job.repository;

import com.teamlms.backend.domain.job.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, String> {
    // 사업자번호로 기업 조회 (이미 있는지 확인용)
    Optional<Company> findByBizNo(String bizNo);
}