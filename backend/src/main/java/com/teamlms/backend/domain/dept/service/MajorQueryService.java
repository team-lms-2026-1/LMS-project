package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.api.dto.DeptMajorDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.MajorDropdownItem;
import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MajorQueryService {

    private final MajorRepository majorRepository;
    private final DeptRepository deptRepository;

    public Major getOrThrow(Long majorId) {
        return majorRepository.findById(majorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.Major_NOT_FOUND, majorId));
    }

    public List<Major> listByDept(Long deptId) {
        return majorRepository.findAllByDeptIdOrderBySortOrderAscMajorIdAsc(deptId);
    }

    public Page<Major> pageByDept(Long deptId, Pageable pageable) {
        return majorRepository.findAllByDeptId(deptId, pageable);
    }

    // 전공 목록 ( 학과 선택후 드롭다운 )
    public List<DeptMajorDropdownItem> getDeptMajorDropdown(Long deptId) {
        getOrThrow(deptId);

        return majorRepository.findActiveForDropdownByDeptId(deptId)
                .stream()
                .map(DeptMajorDropdownItem::from)
                .toList();
    }

    // 전공 드롭다운
    public List<MajorDropdownItem> getMajorDropdown() {
        return majorRepository.findActiveForDropdown()
                .stream()
                .map(MajorDropdownItem::from)
                .toList();

    }
}
