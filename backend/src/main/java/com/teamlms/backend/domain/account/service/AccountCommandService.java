package com.teamlms.backend.domain.account.service;

import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateRequest;
import com.teamlms.backend.domain.account.entity.*;
import com.teamlms.backend.domain.account.enums.*;
import com.teamlms.backend.domain.account.repository.*;
import com.teamlms.backend.domain.authorization.service.DefaultRoleAssignerService;
import com.teamlms.backend.global.exception.DuplicateLoginIdException;
import lombok.RequiredArgsConstructor;

import com.teamlms.backend.global.exception.AccountNotFoundException;

import java.time.LocalDateTime;

import org.springframework.security.access.prepost.PreAuthorize;
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

    /**
     * 관리자: 계정 생성
     * - account insert
     * - accountType별 profile insert
     * - majors는 현재 DB 없음 -> 저장하지 않음
     */
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public Long adminCreate(AdminAccountCreateRequest req, Long actorAccountId) {

        if (accountRepository.existsByLoginId(req.getLoginId())) {
            throw new DuplicateLoginIdException(req.getLoginId());
        }

        AccountType accountType = AccountType.valueOf(req.getAccountType());
        AccountStatus status = AccountStatus.valueOf(req.getStatus());

        Account account = Account.builder()
                .loginId(req.getLoginId())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .accountType(accountType)
                .status(status)
                .build();

        account = accountRepository.save(account);

        AdminAccountCreateRequest.Profile p = req.getProfile();

        switch (accountType) {
            case STUDENT -> createStudentProfile(account, p);
            case PROFESSOR -> createProfessorProfile(account, p);
            case ADMIN -> createAdminProfile(account, p);
        }

        //
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
                .gradeLevel(p.getGradeLevel())
                .academicStatus(AcademicStatus.valueOf(p.getAcademicStatus()))
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
                .name(p.getName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .memo(p.getMemo())
                .build();

        adminProfileRepository.save(ap);
    }

}
