package com.teamlms.backend.domain.curricular.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.curricular.entity.Enrollment;
import com.teamlms.backend.domain.curricular.enums.EnrollmentStatus;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long>, EnrollmentRepositoryCustom {

    List<Enrollment> findByOfferingId(Long offeringId);

    long countByOfferingIdAndEnrollmentStatus(Long offeringId, EnrollmentStatus status);

    // ✅ 성적 미입력자 존재 여부 확인
    boolean existsByOfferingIdAndEnrollmentStatusAndRawScoreIsNull(
            Long offeringId,
            EnrollmentStatus status
    );
    
        // 학생이 특정 개설 교과에 신청했는지
    Optional<Enrollment> findByOfferingIdAndStudentAccountId(
            Long offeringId,
            Long studentAccountId
    );
    
}