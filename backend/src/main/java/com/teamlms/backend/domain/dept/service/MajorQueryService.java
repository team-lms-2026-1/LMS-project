package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.global.exception.MajorNotFoundException;
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

    public Major getOrThrow(Long majorId) {
        return majorRepository.findById(majorId)
                .orElseThrow(() -> new MajorNotFoundException(majorId));
    }

    public List<Major> listByDept(Long deptId) {
        return majorRepository.findAllByDeptIdOrderBySortOrderAscMajorIdAsc(deptId);
    }

    public Page<Major> pageByDept(Long deptId, Pageable pageable) {
        return majorRepository.findAllByDeptId(deptId, pageable);
    }
}
