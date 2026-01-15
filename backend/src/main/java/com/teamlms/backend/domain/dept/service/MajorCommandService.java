package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.global.exception.DeptNotFoundException;
import com.teamlms.backend.global.exception.MajorNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MajorCommandService {

    private final DeptRepository deptRepository;
    private final MajorRepository majorRepository;

    public Long create(Long deptId, Long majorId, String majorCode, String majorName, String description, int sortOrder) {
        if (!deptRepository.existsById(deptId)) {
            throw new DeptNotFoundException(deptId);
        }
        if (majorRepository.existsByMajorCode(majorCode)) {
            throw new IllegalStateException("이미 존재하는 전공 코드입니다. majorCode=" + majorCode);
        }
        if (majorRepository.existsByDeptIdAndMajorName(deptId, majorName)) {
            throw new IllegalStateException("해당 학과에 동일 전공명이 존재합니다. majorName=" + majorName);
        }
        if (!majorRepository.existsByMajorIdAndDeptId(majorId, deptId)) {
            throw new IllegalStateException("해당 학과의 전공이 아닙니다.");
        }


        Major major = Major.builder()
                .deptId(deptId)
                .majorCode(majorCode)
                .majorName(majorName)
                .description(description)
                .active(true)
                .sortOrder(sortOrder)
                .build();

        Major saved = majorRepository.save(major);
        return saved.getMajorId();
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
