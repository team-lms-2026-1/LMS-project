package com.teamlms.backend.domain.account.service;

import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateRequest;
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
import com.teamlms.backend.global.exception.DuplicateLoginIdException;
import lombok.RequiredArgsConstructor;

import com.teamlms.backend.global.exception.AccountNotFoundException;

import java.time.LocalDateTime;

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
            throw new DuplicateLoginIdException(req.getLoginId());
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
        
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException(accountId));

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
            Long majorId = m.getMajorId();
            MajorType majorType = m.getMajorType();

            Major major = majorRepository.findById(majorId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 majorId=" + majorId));

            // ✅ 핵심 검증: 전공은 반드시 학생의 소속학과(deptId)에 속해야 함
            if (!major.getDeptId().equals(deptId)) {
                throw new IllegalArgumentException("majorId=" + majorId + "는 deptId=" + deptId + " 소속 전공이 아닙니다.");
            }

            StudentMajor sm = StudentMajor.of(studentAccount.getAccountId(), major.getMajorId(), majorType);
            studentMajorRepository.save(sm);
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


}
