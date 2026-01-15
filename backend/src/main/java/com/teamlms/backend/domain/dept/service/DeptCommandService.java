package com.teamlms.backend.domain.dept.service;

import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.DeptNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DeptCommandService {

    private final DeptRepository deptRepository;

    public Long create(String deptCode, String deptName, String description, Long actorAccountId) {
        // 중복 방지 (DB unique는 마지막 방어)
        if (deptRepository.existsByDeptCode(deptCode)) {
            throw new IllegalStateException("이미 존재하는 학과 코드입니다. deptCode=" + deptCode);
        }
        if (deptRepository.existsByDeptName(deptName)) {
            throw new IllegalStateException("이미 존재하는 학과명입니다. deptName=" + deptName);
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

    public void updateInfo(Long deptId, String deptName, String description) {
        Dept dept = deptRepository.findById(deptId)
                .orElseThrow(() -> new DeptNotFoundException(deptId));

        dept.updateInfo(deptName, description);
    }

    /**
     * 학과장 지정/변경
     * - 여기서 "교수인지", "해당 학과 소속인지" 검증은
     *   account/professor_profile 쿼리가 필요하므로, 추후 AccountService 연동 때 추가하면 됨.
     */
    public void assignHeadProfessor(Long deptId, Long headProfessorAccountId) {
        Dept dept = deptRepository.findById(deptId)
                .orElseThrow(() -> new DeptNotFoundException(deptId));

        dept.assignHeadProfessor(headProfessorAccountId);
    }

    public void clearHeadProfessor(Long deptId) {
        Dept dept = deptRepository.findById(deptId)
                .orElseThrow(() -> new DeptNotFoundException(deptId));

        dept.clearHeadProfessor();
    }

    public void deactivate(Long deptId) {
        Dept dept = deptRepository.findById(deptId)
                .orElseThrow(() -> new DeptNotFoundException(deptId));

        dept.deactivate();
    }
}
