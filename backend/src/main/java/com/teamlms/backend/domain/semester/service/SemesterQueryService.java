package com.teamlms.backend.domain.semester.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.semester.api.dto.SemesterDropdownItem;
import com.teamlms.backend.domain.semester.api.dto.SemesterEditFormResponse;
import com.teamlms.backend.domain.semester.api.dto.SemesterListItem;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SemesterQueryService {

    private final SemesterRepository semesterRepository;

    // 학기수정(수정창 조회)
    public SemesterEditFormResponse getSemesterForUpdate(Long semesterId) {

        Semester semmester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, semesterId));
        return SemesterEditFormResponse.from(semmester);
    }

    // 학기목록 조회
    public Page<SemesterListItem> listSemesters(Pageable pageable){
        return semesterRepository.findAll(pageable)
                .map(SemesterListItem::from);
    }

    // 학기 목록 드롭다운 조회
    public List<SemesterDropdownItem> getSemesterDropdown() {
        return semesterRepository.findAll(Sort.by(Sort.Direction.DESC, "year")
                                        .and(Sort.by(Sort.Direction.DESC, "term")))
                .stream()
                .map(SemesterDropdownItem::from)
                .toList();
    }

}
