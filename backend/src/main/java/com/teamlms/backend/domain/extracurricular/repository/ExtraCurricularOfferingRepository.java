package com.teamlms.backend.domain.extracurricular.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingUserListItem;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;

import jakarta.persistence.LockModeType;

public interface ExtraCurricularOfferingRepository extends JpaRepository<ExtraCurricularOffering, Long>, ExtraCurricularOfferingRepositoryCustom {

    boolean existsByExtraOfferingCode(String extraOfferingCode);

    boolean existsByExtraOfferingCodeAndExtraOfferingIdNot(String extraOfferingCode, Long extraOfferingId);

    boolean existsBySemesterId(Long semesterId);
    
    // 목록  (user) open만 
    @Query("""
        select new com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularOfferingUserListItem(
            o.extraOfferingId,
            o.extraOfferingCode,
            o.extraOfferingName,
            o.hostContactName,
            o.rewardPointDefault,
            o.recognizedHoursDefault
        )
        from ExtraCurricularOffering o
        where o.status = com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus.OPEN
          and (
                :keyword is null
                or :keyword = ''
                or lower(o.extraOfferingCode) like lower(concat('%', :keyword, '%'))
                or lower(o.extraOfferingName) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(o.hostContactName, '')) like lower(concat('%', :keyword, '%'))
          )
    """)
    Page<ExtraCurricularOfferingUserListItem> findOfferingUserList(
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from ExtraCurricularOffering o where o.extraOfferingId = :id")
    Optional<ExtraCurricularOffering> findByIdForUpdate(@Param("id") Long id);
}
