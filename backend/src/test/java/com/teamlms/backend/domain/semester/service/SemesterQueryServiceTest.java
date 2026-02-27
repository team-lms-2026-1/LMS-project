package com.teamlms.backend.domain.semester.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.teamlms.backend.domain.semester.api.dto.SemesterDropdownItem;
import com.teamlms.backend.domain.semester.api.dto.SemesterEditFormResponse;
import com.teamlms.backend.domain.semester.api.dto.SemesterListItem;
import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.enums.SemesterStatus;
import com.teamlms.backend.domain.semester.enums.Term;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;

@ExtendWith(MockitoExtension.class)
class SemesterQueryServiceTest {

    @InjectMocks
    private SemesterQueryService semesterQueryService;

    @Mock
    private SemesterRepository semesterRepository;

    @Test
    @DisplayName("수정용 학기 조회 성공")
    void getSemesterForUpdate_Success() {
        // given
        Long semesterId = 1L;
        Semester semester = Semester.builder()
                .semesterId(semesterId)
                .year(2024)
                .term(Term.FIRST)
                .build();

        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        // when
        SemesterEditFormResponse response = semesterQueryService.getSemesterForUpdate(semesterId);

        // then
        assertEquals(semesterId, response.semesterId());
        assertEquals(2024, response.year());
    }

    @Test
    @DisplayName("학기 목록 조회 (페이징)")
    void listSemesters_Success() {
        // given
        Pageable pageable = PageRequest.of(0, 10);
        Semester semester = Semester.builder()
                .semesterId(1L)
                .year(2024)
                .term(Term.FIRST)
                .build();
        Page<Semester> page = new PageImpl<>(List.of(semester));

        when(semesterRepository.findAll(pageable)).thenReturn(page);

        // when
        Page<SemesterListItem> result = semesterQueryService.listSemesters(pageable);

        // then
        assertEquals(1, result.getTotalElements());
        assertEquals(1L, result.getContent().get(0).semesterId());
    }

    @Test
    @DisplayName("학기 드롭다운 목록 조회 - 활성 상태만 포함")
    void getSemesterDropdown_Success() {
        // given
        Semester activeSem = Semester.builder()
                .semesterId(1L)
                .year(2024)
                .term(Term.FIRST)
                .status(SemesterStatus.ACTIVE)
                .build();
        Semester plannedSem = Semester.builder()
                .semesterId(2L)
                .year(2024)
                .term(Term.SECOND)
                .status(SemesterStatus.PLANNED)
                .build();

        when(semesterRepository.findAll(any(Sort.class))).thenReturn(List.of(activeSem, plannedSem));

        // when
        List<SemesterDropdownItem> result = semesterQueryService.getSemesterDropdown();

        // then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).semesterId());
    }
}
