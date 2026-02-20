package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.dept.api.dto.MajorUpdateRequest;
import com.teamlms.backend.domain.dept.api.dto.ProfessorDropdownItem;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DeptCommandService {

    private final DeptRepository deptRepository;
    private final MajorRepository majorRepository;
    private final ProfessorProfileRepository professorProfileRepository;
    private final StudentMajorRepository studentMajorRepository;

    // 학과 등록
    public Long create(String deptCode, String deptName, String description, Long actorAccountId) {
        // 중복 방지 (DB unique는 마지막 방어)
        if (deptRepository.existsByDeptCode(deptCode)) {
            throw new BusinessException(ErrorCode.DUPLICATE_DEPT_CODE);
        }
        if (deptRepository.existsByDeptName(deptName)) {
            throw new BusinessException(ErrorCode.DUPLICATE_DEPT_NAME);
        }

        Dept dept = Dept.builder()
                .deptCode(deptCode)
                .deptName(deptName)
                .description(description)
                .headProfessorAccountId(null) // 학과장 공석 허용
                .active(true)
                .build();

        Dept saved = deptRepository.save(dept);
        return saved.getDeptId();
    }


    // 학과 수정
    public void update(Long deptId, String deptName, Long headProfessorAccountId, String description, Long actorAccountId) {

        Dept dept = deptRepository.findById(deptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId));

        // 이름 변경 시 중복 체크
        if (!dept.getDeptName().equals(deptName) && deptRepository.existsByDeptName(deptName)) {
            throw new BusinessException(ErrorCode.DUPLICATE_DEPT_NAME);
        }

        if (headProfessorAccountId != null) {
            // 1) 교수 소속 검증 (최소)
            boolean ok = professorProfileRepository.existsByAccountIdAndDeptId(headProfessorAccountId, deptId);
            if (!ok) {
                throw new BusinessException(ErrorCode.INVALID_HEAD_PROFESSOR, headProfessorAccountId, deptId);
            }

            // (선택) 2) accountType/ACTIVE까지 검증하려면 AccountRepository/Querydsl로 추가 검증
        }

        dept.updateInfo(deptName, headProfessorAccountId, description, actorAccountId);
    }


    // 활성화 비활성화
    public void updateActive(Long deptId, boolean isActive, Long actorAccountId) {

        Dept dept = deptRepository.findById(deptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId));

        // 이미 같은 상태면 그냥 종료(멱등)
        if (dept.isActive() == isActive) {
            return;
        }

        // 비활성화로 전환하는 경우에만 “연관 데이터 존재 여부” 체크
        if (!isActive) {
            boolean hasMajor = majorRepository.existsByDeptIdAndActiveTrue(deptId);
            boolean hasActiveProfessor = professorProfileRepository.existsActiveProfessorByDeptId(deptId);
            boolean hasEnrolledPrimaryStudent = studentMajorRepository.existsEnrolledPrimaryStudentByDeptId(deptId);

            if (hasMajor || hasActiveProfessor || hasEnrolledPrimaryStudent) {
                throw new BusinessException(ErrorCode.DEPT_DEACTIVATE_NOT_ALLOWED);
            }
        }


        if (isActive) {
            dept.activate();
        } else {
            dept.deactivate();
        }
    }

    // 담당교수 지정
    public void updateHeadProfessor(Long deptId, Long professorAccountId) {
        Dept dept = deptRepository.findById(deptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId));

        // 교수 소속 검증
        if (!professorProfileRepository.existsByAccountIdAndDeptId(professorAccountId, deptId)) {
             throw new BusinessException(ErrorCode.INVALID_HEAD_PROFESSOR, professorAccountId, deptId);
        }
        
        dept.assignHeadProfessor(professorAccountId);
    }
}
