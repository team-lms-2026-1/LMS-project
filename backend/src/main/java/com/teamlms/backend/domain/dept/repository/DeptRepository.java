package com.teamlms.backend.domain.dept.repository;

import com.teamlms.backend.domain.dept.entity.Dept;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeptRepository extends JpaRepository<Dept, Long>, DeptRepositoryCustom {

    Optional<Dept> findByDeptCode(String deptCode);

    boolean existsByDeptCode(String deptCode);
    boolean existsByDeptName(String deptName);

    Page<Dept> findAllByActive(boolean active, Pageable pageable);

    Page<Dept> findByDeptNameContainingIgnoreCase(String keyword, Pageable pageable);
}
