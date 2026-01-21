package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.api.dto.MajorCreateRequest;
import com.teamlms.backend.domain.dept.api.dto.MajorUpdateRequest;
import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
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
    private final StudentMajorRepository studentMajorRepository;


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

    // 학과 전공 수정
    public void updateMajor(
        Long deptId,
        Long majorId,
        MajorUpdateRequest request
    ) {
        // 1. 학과 존재 여부
        if (!deptRepository.existsById(deptId)) {
            throw new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId);
        }

        // 2. 전공 조회
        Major major = majorRepository.findById(majorId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.MAJOR_NOT_FOUND, majorId));

        // 3. 학과 소속 검증
        if (!major.getDeptId().equals(deptId)) {
            throw new BusinessException(
                    ErrorCode.MAJOR_NOT_IN_DEPT,
                    deptId,
                    majorId
            );
        }

        // 4. 학과 내 전공명 중복 (이름 변경 시만)
        if (!major.getMajorName().equals(request.majorName())) {
            if (majorRepository.existsByDeptIdAndMajorName(
                    deptId,
                    request.majorName()
            )) {
                throw new BusinessException(
                        ErrorCode.DUPLICATE_MAJOR_NAME,
                        deptId,
                        request.majorName()
                );
            }
        }
        major.update(
            request.majorName(),
            request.description()
        );
    }

    // 학과 전공 삭제
    public void deleteMajor(Long deptId, Long majorId) {

        if (!deptRepository.existsById(deptId)) {
            throw new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId);
        }

        Major major = majorRepository.findById(majorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MAJOR_NOT_FOUND, majorId));

        if (!major.getDeptId().equals(deptId)) {
            throw new BusinessException(ErrorCode.MAJOR_NOT_IN_DEPT, deptId, majorId);
        }

        // 참조 여부 확인 (예: 학생-전공 매핑이 있을 때)
        if (studentMajorRepository.existsByIdMajorId(majorId)) {
            throw new BusinessException(ErrorCode.MAJOR_IN_USE, majorId);
        }

        majorRepository.delete(major);
    }

}
