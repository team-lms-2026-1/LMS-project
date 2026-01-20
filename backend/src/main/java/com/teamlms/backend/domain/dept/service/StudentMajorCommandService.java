package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.entity.StudentMajor;
import com.teamlms.backend.domain.dept.entity.StudentMajorId;
import com.teamlms.backend.domain.dept.enums.MajorType;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentMajorCommandService {

    private final MajorRepository majorRepository;
    private final StudentMajorRepository studentMajorRepository;

    public void assign(Long studentAccountId, Long majorId, MajorType majorType) {
        if (!majorRepository.existsById(majorId)) {
            throw  new BusinessException(ErrorCode.Major_NOT_FOUND, majorId);
        }
        if (studentMajorRepository.existsByIdStudentAccountIdAndIdMajorId(studentAccountId, majorId)) {
            throw new IllegalStateException("이미 등록된 전공입니다.");
        }

        // PRIMARY는 학생당 1개만
        if (majorType == MajorType.PRIMARY) {
            studentMajorRepository.findByIdStudentAccountIdAndMajorType(studentAccountId, MajorType.PRIMARY)
                    .ifPresent(sm -> { throw new IllegalStateException("이미 주전공(PRIMARY)이 존재합니다."); });
        }

        try {
            studentMajorRepository.save(StudentMajor.of(studentAccountId, majorId, majorType));
        } catch (DataIntegrityViolationException e) {
            // DB 유니크(부분 인덱스/PK) 걸렸을 때 안전망
            throw new IllegalStateException("전공 배정 중 제약조건 위반이 발생했습니다.");
        }
    }

    public void changeMajorType(Long studentAccountId, Long majorId, MajorType majorType) {
        StudentMajorId id = new StudentMajorId(studentAccountId, majorId);
        StudentMajor sm = studentMajorRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("학생 전공 매핑을 찾을 수 없습니다."));

        if (majorType == MajorType.PRIMARY) {
            studentMajorRepository.findByIdStudentAccountIdAndMajorType(studentAccountId, MajorType.PRIMARY)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> { throw new IllegalStateException("이미 주전공(PRIMARY)이 존재합니다."); });
        }

        try {
            sm.changeMajorType(majorType);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("전공 타입 변경 중 제약조건 위반이 발생했습니다.");
        }
    }

    public void unassign(Long studentAccountId, Long majorId) {
        StudentMajorId id = new StudentMajorId(studentAccountId, majorId);
        if (!studentMajorRepository.existsById(id)) {
            return; // 멱등 처리
        }
        studentMajorRepository.deleteById(id);
    }
}
