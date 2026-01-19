package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.api.dto.DepartmentDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptListItem;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.DeptNotFoundException;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeptQueryService {

    private final DeptRepository deptRepository;
    // 단건조회
    public Dept getOrThrow(Long deptId) {
        return deptRepository.findById(deptId)
                .orElseThrow(() -> new DeptNotFoundException(deptId));
    }
    // 목록조회
    public Page<Dept> search(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return deptRepository.findAll(pageable);
        }
        return deptRepository.findByDeptNameContainingIgnoreCase(keyword, pageable);
    }

    public Page<Dept> listActive(boolean active, Pageable pageable) {
        return deptRepository.findAllByActive(active, pageable);
    }

    // 목록조회 ( 신버전 )
    public Page<DeptListItem> list(String keyword, Pageable pageable) {
        return deptRepository.searchDeptList(keyword, pageable);
    }

    // 학과 목록 ( 드롭 다운 )
    public List<DepartmentDropdownItem> getDeptDropdown() {
        return deptRepository.findActiveForDropdown()
                .stream() // 컬렉션을 하나씩 처리할 수 있는 흐름(stream) 으로 바꿔줌
                .map(DepartmentDropdownItem::from) // 각요소를 변환 Department -> DropdownItem 으로 , dto의 from 연관
                .toList();
    }
}
