package com.teamlms.backend.domain.dept.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.dept.api.dto.DeptListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptSummaryResponse;
import com.teamlms.backend.domain.dept.entity.Dept;

public interface DeptRepositoryCustom {
    Page<DeptListItem> searchDeptList(
        String keyword,
        Pageable pagealbe
    );
    
    // 학과 드롭다운
    List<Dept> findActiveForDropdown();

    //상세 페이지 ( summary )
    Optional<DeptSummaryResponse> fetchDeptSummary(Long deptId);

}
