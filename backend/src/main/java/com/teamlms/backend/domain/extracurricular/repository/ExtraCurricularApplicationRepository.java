package com.teamlms.backend.domain.extracurricular.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularApplication;
import com.teamlms.backend.domain.extracurricular.enums.CompletionStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;

public interface ExtraCurricularApplicationRepository
        extends JpaRepository<ExtraCurricularApplication, Long> {

    /**
     * 운영별 신청자 목록 (취소 제외)
     */
    @Query("""
        select a.applicationId
        from ExtraCurricularApplication a
        where a.extraOfferingId = :extraOfferingId
          and a.applyStatus = :applyStatus
    """)
    List<Long> findApplicationIdsByOfferingAndApplyStatus(
            @Param("extraOfferingId") Long extraOfferingId,
            @Param("applyStatus") ExtraApplicationApplyStatus applyStatus
    );

    /**
     * 이수 결과 확정
     */
    @Modifying(flushAutomatically = true)
    @Query("""
        update ExtraCurricularApplication a
        set a.completionStatus = :completionStatus,
            a.passedAt = :passedAt
        where a.applicationId = :applicationId
    """)
    void updateCompletionStatusAndPassedAt(
            @Param("applicationId") Long applicationId,
            @Param("completionStatus") CompletionStatus completionStatus,
            @Param("passedAt") LocalDateTime passedAt
    );
    
    Optional<ExtraCurricularApplication> findByExtraOfferingIdAndStudentAccountId(Long extraOfferingId, Long studentAccountId);

    boolean existsByExtraOfferingIdAndStudentAccountId(Long extraOfferingId, Long studentAccountId);

    boolean existsByExtraOfferingIdAndStudentAccountIdAndApplyStatus(
        Long extraOfferingId,
        Long studentAccountId,
        ExtraApplicationApplyStatus applyStatus
    );    

    @Query("""
        select a
          from ExtraCurricularApplication a
          join ExtraCurricularOffering o
            on o.extraOfferingId = a.extraOfferingId
         where a.studentAccountId = :studentAccountId
           and o.semesterId = :semesterId
    """)
    List<ExtraCurricularApplication> findByStudentAccountIdAndSemesterId(
        @Param("studentAccountId") Long studentAccountId,
        @Param("semesterId") Long semesterId
    );
    
    @Query("""
        select a.applicationId
        from ExtraCurricularApplication a
        where a.extraOfferingId = :extraOfferingId
        and a.studentAccountId = :studentAccountId
        and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
    """)
    Optional<Long> findAppliedApplicationId(Long extraOfferingId, Long studentAccountId);
}
