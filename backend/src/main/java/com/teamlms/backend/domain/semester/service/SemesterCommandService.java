package com.teamlms.backend.domain.semester.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.teamlms.backend.domain.competency.repository.DiagnosisRunRepository;
import com.teamlms.backend.domain.competency.repository.SemesterCompetencyCohortStatRepository;
import com.teamlms.backend.domain.competency.repository.SemesterStudentCompetencySummaryRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.domain.mentoring.repository.MentoringRecruitmentRepository;
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
    private final CurricularOfferingRepository curricularOfferingRepository;
    private final ExtraCurricularOfferingRepository extraCurricularOfferingRepository;
    private final MentoringRecruitmentRepository mentoringRecruitmentRepository;
    private final DiagnosisRunRepository diagnosisRunRepository;
    private final SemesterStudentCompetencySummaryRepository semesterStudentCompetencySummaryRepository;
    private final SemesterCompetencyCohortStatRepository semesterCompetencyCohortStatRepository;
    
    // 학기 생성
    public void create(int year, Term term, LocalDate startDate, LocalDate endDate) {

        validateDateRange(startDate, endDate);

        if (semesterRepository.existsByYearAndTerm(year, term)) {
            throw new BusinessException(ErrorCode.SEMESTER_ALREADY_EXISTS, year, term);
        }

        String displayName = generateDisplayName(year, term);

        Semester semester = Semester.planned(
                year, term, displayName, startDate, endDate
        );

        semesterRepository.save(semester);
    }

    private String generateDisplayName(int year, Term term) {
        return year + "-" + termSuffix(term);
    }

    private String termSuffix(Term term) {
        return switch (term) {
            case FIRST -> "1";
            case SECOND -> "2";
            case SUMMER -> "s";
            case WINTER -> "w";
        };
    }


    // 학기 수정
    public void patchSemester(Long semesterId, LocalDate startDate, LocalDate endDate,  SemesterStatus status) {

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, semesterId));

        LocalDate nextStart = (startDate != null) ? startDate : semester.getStartDate();
        LocalDate nextEnd   = (endDate != null) ? endDate : semester.getEndDate();
        validateDateRange(nextStart, nextEnd);
        validateCloseAllowed(semester, status);

        semester.patch(startDate, endDate, status);
    }


    // 날짜 유효성 검사
    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
    }

    private void validateCloseAllowed(Semester semester, SemesterStatus nextStatus) {
        if (nextStatus != SemesterStatus.CLOSED || semester.getStatus() == SemesterStatus.CLOSED) {
            return;
        }

        Long semesterId = semester.getSemesterId();

        boolean hasCurricularOffering = curricularOfferingRepository.existsBySemesterId(semesterId);
        boolean hasExtraOffering = extraCurricularOfferingRepository.existsBySemesterId(semesterId);
        boolean hasMentoringRecruitment = mentoringRecruitmentRepository.existsBySemesterId(semesterId);
        boolean hasDiagnosisRun = diagnosisRunRepository.existsBySemesterSemesterId(semesterId);
        boolean hasCompetencySummary = semesterStudentCompetencySummaryRepository.existsBySemesterSemesterId(semesterId);
        boolean hasCompetencyStat = semesterCompetencyCohortStatRepository.existsBySemesterSemesterId(semesterId);

        if (hasCurricularOffering
                || hasExtraOffering
                || hasMentoringRecruitment
                || hasDiagnosisRun
                || hasCompetencySummary
                || hasCompetencyStat) {
            throw new BusinessException(ErrorCode.SEMESTER_DEACTIVATE_NOT_ALLOWED);
        }
    }
}
