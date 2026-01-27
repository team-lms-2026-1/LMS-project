package com.teamlms.backend.domain.extracurricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularListItem;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;

public interface ExtraCurricularRepository extends JpaRepository<ExtraCurricular, Long> {
    
    boolean existsByExtraCurricularCode(String extraCurricularCode);

    @Query("""
        select new com.teamlms.backend.domain.extracurricular.api.dto.ExtraCurricularListItem(
            e.extraCurricularId,
            e.extraCurricularCode,
            e.extraCurricularName,
            e.hostOrgName,
            e.isActive,
            
            e.createdAt
        )
        from ExtraCurricular e
        where
            (:keyword is null or :keyword = '' or
             lower(e.extraCurricularCode) like lower(concat('%', :keyword, '%')) or
             lower(e.extraCurricularName) like lower(concat('%', :keyword, '%')))
        """)
    Page<ExtraCurricularListItem> findList(@Param("keyword") String keyword, Pageable pageable);
}