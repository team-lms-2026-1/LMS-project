package com.teamlms.backend.domain.dept.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.dept.api.dto.DeptListItem;
import com.teamlms.backend.domain.dept.entity.Dept;

public interface DeptRepositoryCustom {
    Page<DeptListItem> searchDeptList(
        String keyword,
        Pageable pagealbe
    );
    
    // 학과 드롭다운
    List<Dept> findActiveForDropdown();
}
