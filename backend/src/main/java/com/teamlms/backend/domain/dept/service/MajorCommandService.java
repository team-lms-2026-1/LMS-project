package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.api.dto.MajorCreateRequest;
import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.global.exception.MajorNotFoundException;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MajorCommandService {

    private final DeptRepository deptRepository;
    private final MajorRepository majorRepository;


    // 전공 생성
    public void create(Long deptId, MajorCreateRequest request) {

        // 1. 학과 존재 여부
        if (!deptRepository.existsById(deptId)) {
            throw new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId);
        }

        // 2. 전공 코드 중복
        if (majorRepository.existsByMajorCode(request.getMajorCode())) {
            throw new BusinessException(ErrorCode.DUPLICATE_MAJOR_CODE, request.getMajorCode());
        }

        // 3. 학과 내 전공명 중복
        if (majorRepository.existsByDeptIdAndMajorName(
                deptId,
                request.getMajorName()
        )) {
            throw new BusinessException(ErrorCode.DUPLICATE_MAJOR_NAME, deptId, request.getMajorName());
        }

        Major major = Major.builder()
                .deptId(deptId)
                .majorCode(request.getMajorCode())
                .majorName(request.getMajorName())
                .description(request.getDescription())
                .active(true)
                .sortOrder(0)
                .build();

        majorRepository.save(major);
    }

    public void updateInfo(Long majorId, String majorName, String description, int sortOrder) {
        Major major = majorRepository.findById(majorId)
                .orElseThrow(() -> new MajorNotFoundException(majorId));

        major.updateInfo(majorName, description, sortOrder);
    }

    public void deactivate(Long majorId) {
        Major major = majorRepository.findById(majorId)
                .orElseThrow(() -> new MajorNotFoundException(majorId));

        major.deactivate();
    }
}
