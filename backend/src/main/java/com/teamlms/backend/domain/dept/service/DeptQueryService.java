package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.DeptNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeptQueryService {

    private final DeptRepository deptRepository;

    public Dept getOrThrow(Long deptId) {
        return deptRepository.findById(deptId)
                .orElseThrow(() -> new DeptNotFoundException(deptId));
    }

    public Page<Dept> search(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return deptRepository.findAll(pageable);
        }
        return deptRepository.findByDeptNameContainingIgnoreCase(keyword, pageable);
    }

    public Page<Dept> listActive(boolean active, Pageable pageable) {
        return deptRepository.findAllByActive(active, pageable);
    }
}
