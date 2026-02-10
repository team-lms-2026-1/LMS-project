package com.teamlms.backend.domain.mypage.service;

import com.teamlms.backend.domain.mypage.api.dto.StudentMypageResponse;
import com.teamlms.backend.domain.mypage.dto.TimetableInfo;
import com.teamlms.backend.domain.mypage.entity.StudentMypageSummary;
import com.teamlms.backend.domain.mypage.repository.MyPageTimetableRepository;
import com.teamlms.backend.domain.mypage.repository.StudentMypageSummaryRepository;
import com.teamlms.backend.domain.semester.enums.Term;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyPageQueryService {

    private final StudentMypageSummaryRepository studentMypageSummaryRepository;
    private final com.teamlms.backend.global.s3.S3Service s3Service;
    private final MyPageTimetableRepository myPageTimetableRepository;

    /**
     * 학생 마이페이지 종합 정보 조회 (API Response)
     * 
     * @param accountId 계정 ID
     * @param year      조회할 연도 (Optional)
     * @param term      조회할 학기 (Optional)
     * @return StudentMypageResponse
     */
    public StudentMypageResponse getStudentMyPage(Long accountId, Integer year, String term) {
        StudentMypageSummary summary = studentMypageSummaryRepository.findByAccountId(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        List<TimetableInfo> timetable = getTimetable(accountId, summary, year, term);

        return toResponse(summary, timetable);
    }

    /**
     * 관리자: 학생 프로필 이미지 URL 조회 (Presigned)
     */
    public String getStudentProfileImageUrl(Long accountId) {
        StudentMypageSummary summary = studentMypageSummaryRepository.findByAccountId(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        String key = extractKeyFromUrl(entityToUrl(summary));
        return (key != null) ? s3Service.createPresignedGetUrl(key) : summary.getProfileImageUrl();
    }

    private String entityToUrl(StudentMypageSummary summary) {
        return summary.getProfileImageUrl();
    }

    private List<TimetableInfo> getTimetable(Long accountId, StudentMypageSummary summary, Integer year, String term) {
        if (year != null && term != null) {
            try {
                return myPageTimetableRepository.findTimetableBySemester(
                        accountId,
                        year,
                        Term.valueOf(term));
            } catch (IllegalArgumentException e) {
                // Invalid term string fallback
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }
        }
        return summary.getCurrentTimetableJson();
    }

    private StudentMypageResponse toResponse(StudentMypageSummary entity, List<TimetableInfo> timetable) {
        String key = extractKeyFromUrl(entity.getProfileImageUrl());
        String presignedUrl = (key != null) ? s3Service.createPresignedGetUrl(key) : entity.getProfileImageUrl();

        return StudentMypageResponse.builder()
                .accountId(entity.getAccountId())
                .studentNo(entity.getStudentNo())
                .studentName(entity.getStudentName())
                .deptName(entity.getDeptName())
                .gradeLevel(entity.getGradeLevel())
                .academicStatus(entity.getAcademicStatus())
                .profileImageUrl(presignedUrl)
                .profileImageKey(key)
                .totalCredits(entity.getTotalCredits())
                .averageScore(entity.getAverageScore())
                .totalExtraPoints(entity.getTotalExtraPoints())
                .totalExtraHours(entity.getTotalExtraHours())
                .currentTimetable(timetable)
                .build();
    }

    private String extractKeyFromUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        int index = url.indexOf("profiles/");
        if (index != -1) {
            return url.substring(index);
        }
        return null;
    }
}