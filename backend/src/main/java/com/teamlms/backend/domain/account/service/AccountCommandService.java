package com.teamlms.backend.domain.account.service;

import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateRequest;
import com.teamlms.backend.domain.account.api.dto.AdminAccountUpdateRequest;
import com.teamlms.backend.domain.account.entity.*;
import com.teamlms.backend.domain.account.enums.*;
import com.teamlms.backend.domain.account.repository.*;
import com.teamlms.backend.domain.authorization.service.DefaultRoleAssignerService;
import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.entity.StudentMajor;
import com.teamlms.backend.domain.dept.enums.MajorType;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;


import java.time.LocalDateTime;
import java.util.List;

import javax.security.auth.login.AccountNotFoundException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountCommandService {

    private final AccountRepository accountRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ProfessorProfileRepository professorProfileRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final DefaultRoleAssignerService defaultRoleAssignerService;

    private final DeptRepository deptRepository;
    private final MajorRepository majorRepository;
    private final StudentMajorRepository studentMajorRepository;

    public Long adminCreate(AdminAccountCreateRequest req, Long actorAccountId) {

        if (accountRepository.existsByLoginId(req.getLoginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_LOGIN_ID, req.getLoginId());
        }

        AccountType accountType = req.getAccountType();
        AccountStatus status = req.getStatus();

        Account account = Account.builder()
                .loginId(req.getLoginId())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .accountType(accountType)
                .status(status)
                .build();

        account = accountRepository.save(account);

        AdminAccountCreateRequest.Profile p = req.getProfile();

        switch (accountType) {
            case STUDENT -> {
                validateStudentOrThrow(p);
                createStudentProfile(account, p);
                saveStudentMajorsOrThrow(account, p);
            }
            case PROFESSOR -> {
                validateProfessorOrThrow(p);
                createProfessorProfile(account, p);
            }
            case ADMIN -> {
                createAdminProfile(account, p);
            }
        }

        // 비즈니스 행위 기록
        defaultRoleAssignerService.assignDefaultRole(
                account.getAccountId(),
                accountType,
                actorAccountId
        );
        

        return account.getAccountId();
    }

    public Account updateStatus(Long accountId, AccountStatus status, Long actorAccountId ) {
        
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        AccountStatus newStatus = status; // 문자열에서 enum변환

        account.changeStatus(newStatus, actorAccountId, LocalDateTime.now());

        return account;
    }

    // private

    private void createStudentProfile(Account account, AdminAccountCreateRequest.Profile p) {
        StudentProfile sp = StudentProfile.builder()
                .account(account) // ✅ MapsId가 accountId 자동 세팅
                .studentNo(p.getStudentNo())
                .name(p.getName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .deptId(p.getDeptId())
                .gradeLevel(p.getGradeLevel())
                .academicStatus(p.getAcademicStatus())
                .build();

        studentProfileRepository.save(sp);
    }


    private void createProfessorProfile(Account account, AdminAccountCreateRequest.Profile p) {

        ProfessorProfile pp = ProfessorProfile.builder()
                .account(account)
                .professorNo(p.getProfessorNo())
                .name(p.getName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .deptId(p.getDeptId())
                .build();

        professorProfileRepository.save(pp);
    }

    private void createAdminProfile(Account account, AdminAccountCreateRequest.Profile p) {
        AdminProfile ap = AdminProfile.builder()
                .account(account)
                .name(p.getName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .memo(p.getMemo())
                .build();

        adminProfileRepository.save(ap);
    }

    private void validateStudentOrThrow(AdminAccountCreateRequest.Profile p) {

        if (p.getDeptId() == null) {
            throw new IllegalArgumentException("학생 계정은 deptId(소속학과)가 필수입니다.");
        }
        if (!deptRepository.existsById(p.getDeptId())) {
            throw new IllegalArgumentException("존재하지 않는 deptId=" + p.getDeptId());
        }

        if (p.getStudentNo() == null || p.getStudentNo().isBlank()) {
            throw new IllegalArgumentException("학생 계정은 studentNo가 필수입니다.");
        }
        if (p.getGradeLevel() == null) {
            throw new IllegalArgumentException("학생 계정은 gradeLevel(학년)이 필수입니다.");
        }
        if (p.getAcademicStatus() == null ) {
            throw new IllegalArgumentException("학생 계정은 academicStatus(학적상태)가 필수입니다.");
        }

        if (p.getMajors() == null || p.getMajors().isEmpty()) {
            throw new IllegalArgumentException("학생 계정은 majors(전공)가 필수입니다.");
        }

        long primaryCount = p.getMajors().stream()
                .filter(m -> m.getMajorType() == MajorType.PRIMARY)
                .count();

        if (primaryCount != 1) {
            throw new IllegalArgumentException("학생 계정은 PRIMARY 전공이 정확히 1개여야 합니다.");
        }
    }

    private void saveStudentMajorsOrThrow(Account studentAccount, AdminAccountCreateRequest.Profile p) {
        Long deptId = p.getDeptId();

        for (AdminAccountCreateRequest.MajorMapping m : p.getMajors()) {
            Major major = majorRepository.findById(m.getMajorId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 majorId=" + m.getMajorId()));

            // ✅ PRIMARY만 소속학과 강제
            if (m.getMajorType() == MajorType.PRIMARY && !major.getDeptId().equals(deptId)) {
                throw new IllegalArgumentException("PRIMARY 전공 majorId=" + major.getMajorId()
                        + "는 deptId=" + deptId + " 소속 전공이어야 합니다.");
            }

            studentMajorRepository.save(
                    StudentMajor.of(studentAccount.getAccountId(), major.getMajorId(), m.getMajorType())
            );
        }
    }

    private void validateProfessorOrThrow(AdminAccountCreateRequest.Profile p) {
        if (p.getDeptId() == null) {
            throw new IllegalArgumentException("교수 계정은 deptId가 필수입니다.");
        }
        if (!deptRepository.existsById(p.getDeptId())) {
            throw new IllegalArgumentException("존재하지 않는 deptId=" + p.getDeptId());
        }
        if (p.getProfessorNo() == null || p.getProfessorNo().isBlank()) {
            throw new IllegalArgumentException("교수 계정은 professorNo가 필수입니다.");
        }
    }
    
    // 계정 수정
    @Transactional
    public void adminUpdate(Long accountId, AdminAccountUpdateRequest req, Long actorAccountId) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        // 1) Account 공통 업데이트(상태)
        if (req.getStatus() != null) {
            account.changeStatus(req.getStatus(), actorAccountId, LocalDateTime.now()); // 너희 도메인 메서드에 맞게
        }

        // 2) 타입별 profile 업데이트
        switch (account.getAccountType()) {
            case STUDENT -> updateStudentProfile(accountId, req, actorAccountId);
            case PROFESSOR -> updateProfessorProfile(accountId, req, actorAccountId);
            case ADMIN -> updateAdminProfile(accountId, req, actorAccountId);
        }
    }

    private void updateStudentProfile(Long accountId, AdminAccountUpdateRequest req, Long actorAccountId) {
        StudentProfile sp = studentProfileRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        boolean deptChanged = req.getDeptId() != null;
        boolean majorsChanged = req.getMajors() != null;

        // ✅ 정책 강제: 학생은 deptId와 majors를 항상 함께
        if (deptChanged ^ majorsChanged) {
            throw new IllegalArgumentException("학생은 deptId와 majors(주전공 포함)를 함께 수정해야 합니다.");
        }

        // -------------------------
        // 1) 공통/학생 기본 필드 부분수정
        // -------------------------
        if (req.getName() != null) sp.updateName(req.getName());
        if (req.getEmail() != null) sp.updateEmail(req.getEmail());
        if (req.getPhone() != null) sp.updatePhone(req.getPhone());

        if (req.getGradeLevel() != null) sp.updateGradeLevel(req.getGradeLevel());
        if (req.getAcademicStatus() != null) sp.updateAcademicStatus(req.getAcademicStatus());

        // -------------------------
        // 2) 전과 + 전공 전체교체 (둘 다 들어온 경우만)
        // -------------------------
        if (deptChanged && majorsChanged) {
            Long targetDeptId = req.getDeptId();

            if (!deptRepository.existsById(targetDeptId)) {
                throw new IllegalArgumentException("존재하지 않는 deptId=" + targetDeptId);
            }

            validateUpdateMajorsOrThrow(targetDeptId, req.getMajors());

            // dept 변경
            sp.updateDeptId(targetDeptId);

            // ✅ 전공 전체 삭제(먼저 flush되게 bulk delete)
            studentMajorRepository.deleteAllByStudentAccountId(accountId);

            // 재등록
            for (AdminAccountUpdateRequest.MajorMapping m : req.getMajors()) {
                Major major = majorRepository.findById(m.getMajorId())
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 majorId=" + m.getMajorId()));

                // ✅ PRIMARY만 dept 소속 강제
                if (m.getMajorType() == MajorType.PRIMARY && !major.getDeptId().equals(targetDeptId)) {
                    throw new IllegalArgumentException("PRIMARY 전공 majorId=" + major.getMajorId()
                            + "는 deptId=" + targetDeptId + " 소속 전공이어야 합니다.");
                }

                studentMajorRepository.save(
                        StudentMajor.of(accountId, major.getMajorId(), m.getMajorType())
                );
            }

        }
    }


    private void updateProfessorProfile(Long accountId, AdminAccountUpdateRequest req, Long actorAccountId) {
        ProfessorProfile pp = professorProfileRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        if (req.getName() != null) pp.updateName(req.getName());
        if (req.getEmail() != null) pp.updateEmail(req.getEmail());
        if (req.getPhone() != null) pp.updatePhone(req.getPhone());

        if (req.getDeptId() != null) pp.updateDeptId(req.getDeptId());
    }

    private void updateAdminProfile(Long accountId, AdminAccountUpdateRequest req, Long actorAccountId) {
        AdminProfile ap = adminProfileRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        if (req.getName() != null) ap.updateName(req.getName());
        if (req.getEmail() != null) ap.updateEmail(req.getEmail());
        if (req.getPhone() != null) ap.updatePhone(req.getPhone());

        if (req.getMemo() != null) ap.updateMemo(req.getMemo());
    }

    // 학생 전공 검증 메서드
    private void validateUpdateMajorsOrThrow(
            Long targetDeptId,
            List<AdminAccountUpdateRequest.MajorMapping> majors
    ) {
        if (majors == null || majors.isEmpty()) {
            throw new IllegalArgumentException("majors는 비어 있을 수 없습니다.");
        }

        long primaryCount = majors.stream()
                .filter(m -> m.getMajorType() == MajorType.PRIMARY)
                .count();

        if (primaryCount != 1) {
            throw new IllegalArgumentException("PRIMARY 전공은 정확히 1개여야 합니다.");
        }

        long distinctMajorIdCount = majors.stream()
                .map(AdminAccountUpdateRequest.MajorMapping::getMajorId)
                .distinct()
                .count();

        if (distinctMajorIdCount != majors.size()) {
            throw new IllegalArgumentException("majorId가 중복되었습니다.");
        }

        if (targetDeptId == null || !deptRepository.existsById(targetDeptId)) {
            throw new IllegalArgumentException("학생 소속학과(deptId)가 올바르지 않습니다. deptId=" + targetDeptId);
        }

        // ✅ PRIMARY만 dept 소속 검증
        AdminAccountUpdateRequest.MajorMapping primary = majors.stream()
                .filter(m -> m.getMajorType() == MajorType.PRIMARY)
                .findFirst()
                .orElseThrow();

        Major primaryMajor = majorRepository.findById(primary.getMajorId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 majorId=" + primary.getMajorId()));

        if (!primaryMajor.getDeptId().equals(targetDeptId)) {
            throw new IllegalArgumentException("PRIMARY 전공 majorId=" + primaryMajor.getMajorId()
                    + "는 deptId=" + targetDeptId + " 소속 전공이어야 합니다.");
        }
    }


}
