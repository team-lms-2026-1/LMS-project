package com.teamlms.backend.domain.account.repository;

import com.teamlms.backend.domain.account.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    boolean existsByStudentNo(String studentNo);
}
