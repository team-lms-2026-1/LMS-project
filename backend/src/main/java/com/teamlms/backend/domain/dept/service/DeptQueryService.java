package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.account.entity.ProfessorProfile;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.api.dto.DepartmentDropdownItem;
import com.teamlms.backend.domain.dept.api.dto.DeptListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptMajorListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptProfessorListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptStudentListItem;
import com.teamlms.backend.domain.dept.api.dto.DeptSummaryResponse;
import com.teamlms.backend.domain.dept.api.dto.ProfessorDropdownItem;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

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
    private final ProfessorProfileRepository professorProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MajorRepository majorRepository;

    // 단건조회
    public Dept getOrThrow(Long deptId) {
        return deptRepository.findById(deptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId));
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

    // 교수까지 가져오기 수정조회 
    public List<ProfessorDropdownItem> getDeptProfessorDropdown(Long deptId) {
        getOrThrow(deptId);

        return professorProfileRepository.findActiveByDeptIdForDropdown(deptId)
                .stream()
                .map(ProfessorDropdownItem::from)
                .toList();
    }

    // 상세페이지 ( summary )
    public DeptSummaryResponse getSummary(Long deptId) {
        return deptRepository.fetchDeptSummary(deptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPT_NOT_FOUND, deptId));
    }

    // 상세페이지 ( 교수 )
    public Page<DeptProfessorListItem> getDeptProfessors(
        Long deptId,
        String keyword,
        Pageable pageable
    ) {
        getOrThrow(deptId);

        Page<ProfessorProfile> page = professorProfileRepository.searchByDeptId(deptId, keyword, pageable);

        return page.map(DeptProfessorListItem::from);
    }

    // 상세페이지 ( 학생 )
    public Page<DeptStudentListItem> getDeptStudents(
            Long deptId,
            String keyword,
            Pageable pageable
    ) {
        getOrThrow(deptId);
        return studentProfileRepository.searchDeptStudents(deptId, keyword, pageable);
    }

    // 상세페이지 ( 전공 )
    public Page<DeptMajorListItem> getDeptMajors(
            Long deptId,
            String keyword,
            Pageable pageable
    ) {
        getOrThrow(deptId);
        return majorRepository.searchDeptMajors(deptId, keyword, pageable);
    }


}
