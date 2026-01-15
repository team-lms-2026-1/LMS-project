package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.entity.StudentMajor;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentMajorQueryService {

    private final StudentMajorRepository studentMajorRepository;

    public List<StudentMajor> listByStudent(Long studentAccountId) {
        return studentMajorRepository.findAllByIdStudentAccountId(studentAccountId);
    }
}
