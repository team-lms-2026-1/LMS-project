package com.teamlms.backend.domain.account.service;

import com.teamlms.backend.domain.account.api.dto.AdminAccountListItem;
import com.teamlms.backend.domain.account.api.dto.AdminAdminAccountDetailResponse;
import com.teamlms.backend.domain.account.api.dto.AdminProfessorDetailResponse;
import com.teamlms.backend.domain.account.api.dto.AdminStudentDetailResponse;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.dept.enums.MajorType;
import com.teamlms.backend.global.exception.AccountInactiveException;
import com.teamlms.backend.global.exception.AccountNotFoundException;
import com.teamlms.backend.global.exception.AuthenticationFailedException;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 계정 검증 ( 조회/상태/비번)
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public Account getByLoginIdOrThrow(String loginId) {
        return accountRepository.findByLoginId(loginId)
                .orElseThrow(() -> new AccountNotFoundException(loginId));
    }

    public void validateActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountInactiveException(account.getAccountId());
        }
    }

    public void validatePassword(Account account, String rawPassword) {
        if (!passwordEncoder.matches(rawPassword, account.getPasswordHash())) {
            throw new AuthenticationFailedException();
        }
    }

    /**
     * 로그인 인증 (계정 조회 -> 상태 검증 -> 비밀번호 검증)
     */
    public Account authenticate(String loginId, String rawPassword) {
        Account account = getByLoginIdOrThrow(loginId);
        validateActive(account);
        validatePassword(account, rawPassword);
        return account;
    }

    // 목록 조회
    public Page<AdminAccountListItem> adminList(
            String keyword,
            AccountType accountType,
            Pageable pageable
    ) {
        return accountRepository.searchAccounts(keyword, accountType, pageable);
    }

    // 상세 조회
    public Object adminDetail(Long accountId) {
        AccountType type = accountRepository.findAccountTypeById(accountId);
        if (type == null) throw new AccountNotFoundException(accountId);

        return switch (type) {
            case STUDENT -> buildStudentDetail(accountId);
            case PROFESSOR -> {
                AdminProfessorDetailResponse dto = accountRepository.findProfessorDetail(accountId);
                if (dto == null) throw new AccountNotFoundException(accountId);
                yield dto;
            }
            case ADMIN -> {
                AdminAdminAccountDetailResponse dto = accountRepository.findAdminDetail(accountId);
                if (dto == null) throw new AccountNotFoundException(accountId);
                yield dto;
            }
        };
    }

    private AdminStudentDetailResponse buildStudentDetail(Long accountId) {
        AdminStudentDetailResponse base = accountRepository.findStudentBaseDetail(accountId);
        if (base == null) throw new AccountNotFoundException(accountId);

        List<AdminStudentDetailResponse.MajorItem> majors =
                accountRepository.findStudentMajors(accountId);

        // PRIMARY 찾아서 dept/primaryMajor 채우기
        AdminStudentDetailResponse.DeptSimple dept = null;
        AdminStudentDetailResponse.MajorSimple primaryMajor = null;

        for (AdminStudentDetailResponse.MajorItem m : majors) {
            if (m.getMajorType() == MajorType.PRIMARY) {
                dept = m.getDept();
                primaryMajor = AdminStudentDetailResponse.MajorSimple.builder()
                        .majorId(m.getMajorId())
                        .majorName(m.getMajorName())
                        .build();
                break;
            }
        }

        AdminStudentDetailResponse.Profile newProfile = AdminStudentDetailResponse.Profile.builder()
                .name(base.getProfile().getName())
                .email(base.getProfile().getEmail())
                .phone(base.getProfile().getPhone())
                .gradeLevel(base.getProfile().getGradeLevel())
                .academicStatus(base.getProfile().getAcademicStatus())
                .dept(dept)
                .primaryMajor(primaryMajor)
                .majors(majors)
                .build();

        return AdminStudentDetailResponse.builder()
                .accountId(base.getAccountId()) // ✅ DTO 오타 수정돼있어야 함
                .loginId(base.getLoginId())
                .accountType(base.getAccountType())
                .status(base.getStatus())
                .createdAt(base.getCreatedAt())
                .profile(newProfile)
                .build();
    }
}