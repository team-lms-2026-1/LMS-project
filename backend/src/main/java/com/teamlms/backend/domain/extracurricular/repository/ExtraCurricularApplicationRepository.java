package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularApplication;

public interface ExtraCurricularApplicationRepository extends JpaRepository<ExtraCurricularApplication, Long> {

    @org.springframework.data.jpa.repository.Query("""
                SELECT a FROM ExtraCurricularApplication a
                JOIN ExtraCurricularOffering o ON a.extraOfferingId = o.extraOfferingId
                WHERE a.studentAccountId = :studentAccountId
                  AND o.semesterId = :semesterId
            """)
    java.util.List<ExtraCurricularApplication> findByStudentAccountIdAndSemesterId(
            @org.springframework.data.repository.query.Param("studentAccountId") Long studentAccountId,
            @org.springframework.data.repository.query.Param("semesterId") Long semesterId);
}
