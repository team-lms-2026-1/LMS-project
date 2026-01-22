package com.teamlms.backend.domain.mentoring.semester;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SemesterService {
    private final SemesterRepository semesterRepository;

    public List<Semester> getSemesters() {
        return semesterRepository.findAll();
    }
}
