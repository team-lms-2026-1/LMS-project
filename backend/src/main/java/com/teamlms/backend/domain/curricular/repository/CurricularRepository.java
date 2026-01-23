package com.teamlms.backend.domain.curricular.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teamlms.backend.domain.curricular.api.dto.CurricularListItem;
import com.teamlms.backend.domain.curricular.entity.Curricular;

public interface CurricularRepository extends JpaRepository<Curricular, Long> {

    boolean existsByCurricularCode(String curricularCode);

    // 교과 목록 조회
    @Query("""
        select new com.teamlms.backend.domain.curricular.api.dto.CurricularListItem(
            c.curricularId,
            c.curricularCode,
            c.curricularName,
            c.deptId,
            c.credits,
            c.isActive,
            
            d.deptName
        )
        from Curricular c
        join Dept d on d.deptId = c.deptId
        where (:keyword is null or :keyword = ''
              or c.curricularCode like concat('%', :keyword, '%')
              or c.curricularName like concat('%', :keyword, '%')
              or d.deptName like concat('%', :keyword, '%'))
        """)
    Page<CurricularListItem> findList(
        @Param("keyword") String keyword,
        Pageable pageable
    );
}
