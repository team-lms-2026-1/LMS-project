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
import com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraEnrollmentListItem;

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

    @Query("""
        select a.studentAccountId
        from ExtraCurricularApplication a
        where a.extraOfferingId = :extraOfferingId
          and a.applyStatus = :applyStatus
    """)
    List<Long> findStudentAccountIdsByOfferingAndApplyStatus(
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

    List<ExtraCurricularApplication> findAllByExtraOfferingIdAndApplyStatus(
        Long extraOfferingId,
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

    @Query(
        value = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraEnrollmentListItem(
                o.extraOfferingId,
                o.extraOfferingCode,
                o.extraOfferingName,
                o.hostContactName,
                s.displayName,
                o.rewardPointDefault,
                o.recognizedHoursDefault,
                o.status
            )
            from ExtraCurricularApplication a
            join ExtraCurricularOffering o
                on o.extraOfferingId = a.extraOfferingId
            join Semester s
                on s.semesterId = o.semesterId
            where a.studentAccountId = :studentAccountId
              and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
              and o.status in (
                com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.OPEN,
                com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.ENROLLMENT_CLOSED
              )
        """,
        countQuery = """
            select count(a.applicationId)
            from ExtraCurricularApplication a
            join ExtraCurricularOffering o
                on o.extraOfferingId = a.extraOfferingId
            join Semester s
                on s.semesterId = o.semesterId
            where a.studentAccountId = :studentAccountId
              and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
              and o.status in (
                com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.OPEN,
                com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.ENROLLMENT_CLOSED
              )
        """
    )
    org.springframework.data.domain.Page<StudentExtraEnrollmentListItem> findStudentEnrollments(
        @Param("studentAccountId") Long studentAccountId,
        org.springframework.data.domain.Pageable pageable
    );

    @Query(
        value = """
            select new com.teamlms.backend.domain.extracurricular.api.dto.StudentExtraEnrollmentListItem(
                o.extraOfferingId,
                o.extraOfferingCode,
                o.extraOfferingName,
                o.hostContactName,
                s.displayName,
                o.rewardPointDefault,
                o.recognizedHoursDefault,
                o.status
            )
            from ExtraCurricularApplication a
            join ExtraCurricularOffering o
                on o.extraOfferingId = a.extraOfferingId
            join Semester s
                on s.semesterId = o.semesterId
            where a.studentAccountId = :studentAccountId
              and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
              and o.status = com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.IN_PROGRESS
        """,
        countQuery = """
            select count(a.applicationId)
            from ExtraCurricularApplication a
            join ExtraCurricularOffering o
                on o.extraOfferingId = a.extraOfferingId
            join Semester s
                on s.semesterId = o.semesterId
            where a.studentAccountId = :studentAccountId
              and a.applyStatus = com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus.APPLIED
              and o.status = com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.IN_PROGRESS
        """
    )
    org.springframework.data.domain.Page<StudentExtraEnrollmentListItem> findStudentCurrentEnrollments(
        @Param("studentAccountId") Long studentAccountId,
        org.springframework.data.domain.Pageable pageable
    );
}
