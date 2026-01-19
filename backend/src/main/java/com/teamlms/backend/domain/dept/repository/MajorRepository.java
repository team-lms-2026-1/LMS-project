package com.teamlms.backend.domain.dept.repository;

import com.teamlms.backend.domain.dept.entity.Major;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MajorRepository extends JpaRepository<Major, Long>, MajorRepositoryCustom {

    List<Major> findAllByDeptIdOrderBySortOrderAscMajorIdAsc(Long deptId);

    Page<Major> findAllByDeptId(Long deptId, Pageable pageable);

    boolean existsByMajorCode(String majorCode);

    boolean existsByDeptIdAndMajorName(Long deptId, String majorName);

    boolean existsByMajorIdAndDeptId(Long majorId, Long deptId);

    boolean existsByDeptId(Long deptId);
}
