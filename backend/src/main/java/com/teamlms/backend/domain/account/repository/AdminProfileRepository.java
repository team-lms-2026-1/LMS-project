package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.AdminProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminProfileRepository extends JpaRepository<AdminProfile, Long> {
}
