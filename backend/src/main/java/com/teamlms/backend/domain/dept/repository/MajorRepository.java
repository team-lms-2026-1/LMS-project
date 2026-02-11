package com.teamlms.backend.domain.dept.repository;

import com.teamlms.backend.domain.dept.api.dto.DeptMajorListItem;
import com.teamlms.backend.domain.dept.entity.Major;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MajorRepository extends JpaRepository<Major, Long>, MajorRepositoryCustom {

    List<Major> findAllByDeptIdOrderBySortOrderAscMajorIdAsc(Long deptId);

    Page<Major> findAllByDeptId(Long deptId, Pageable pageable);

    boolean existsByMajorCode(String majorCode);

    boolean existsByDeptIdAndMajorName(Long deptId, String majorName);

    boolean existsByMajorIdAndDeptId(Long majorId, Long deptId);

    boolean existsByDeptId(Long deptId);
    
    boolean existsByDeptIdAndActiveTrue(Long deptId);

    // 전공 수정폼 조회용
    Optional<Major> findByMajorIdAndDeptId(Long majorId, Long deptId);
    Optional<Major> findByMajorIdAndDeptIdAndActiveTrue(Long majorId, Long deptId);
    boolean existsByMajorIdAndDeptIdAndActiveTrue(Long majorId, Long deptId);


    // 상세 ( 전공 )
    @Query("""
        select new com.teamlms.backend.domain.dept.api.dto.DeptMajorListItem(
            m.majorId,
            m.majorCode,
            m.majorName,
            count(distinct s.accountId),
            m.active
        )
        from Major m
        left join StudentMajor sm
            on sm.id.majorId = m.majorId
        and sm.majorType = com.teamlms.backend.domain.dept.enums.MajorType.PRIMARY
        left join StudentProfile s
            on s.accountId = sm.id.studentAccountId
        and s.academicStatus = com.teamlms.backend.domain.account.enums.AcademicStatus.ENROLLED
        where m.deptId = :deptId
        and (
            coalesce(:keyword, '') = ''
            or lower(m.majorName) like lower(concat('%', coalesce(:keyword, ''), '%'))
            or lower(m.majorCode) like lower(concat('%', coalesce(:keyword, ''), '%'))
        )
        group by m.majorId, m.majorCode, m.majorName
    """)
    Page<DeptMajorListItem> searchDeptMajors(
            @Param("deptId") Long deptId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

}
