package com.teamlms.backend.domain.semester.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.enums.SemesterStatus;
import com.teamlms.backend.domain.semester.enums.Term;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SemesterCommandService {

    private final SemesterRepository semesterRepository;
    
    // 학기 생성
    public void create(int year, Term term, LocalDate startDate, LocalDate endDate) {
        
        validateDateRange(startDate, endDate);

        if (semesterRepository.existsByYearAndTerm(year, term)) {
            throw new BusinessException(ErrorCode.SEMESTER_ALREADY_EXISTS, year, term);
        }

        Semester semester = Semester.planned(year, term, startDate, endDate);
        semesterRepository.save(semester);
    }

    // 학기 수정
    public void patchSemester(Long semesterId, LocalDate startDate, LocalDate endDate,  SemesterStatus status) {

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, semesterId));

        LocalDate nextStart = (startDate != null) ? startDate : semester.getStartDate();
        LocalDate nextEnd   = (endDate != null) ? endDate : semester.getEndDate();
        validateDateRange(nextStart, nextEnd);

        semester.patch(startDate, endDate, status);
    }


    // 날짜 유효성 검사
    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
    }
}
