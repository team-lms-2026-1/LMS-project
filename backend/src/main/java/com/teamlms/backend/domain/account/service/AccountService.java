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
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

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
    private final com.teamlms.backend.domain.account.repository.StudentProfileRepository studentProfileRepository;
    private final com.teamlms.backend.domain.account.repository.ProfessorProfileRepository professorProfileRepository;
    private final com.teamlms.backend.domain.dept.repository.DeptRepository deptRepository;
    private final PasswordEncoder passwordEncoder;

    public Account getByLoginIdOrThrow(String loginId) {
        return accountRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, loginId));
    }

    public void validateActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE, account.getAccountId());
        }
    }

    public void validatePassword(Account account, String rawPassword) {
        if (!passwordEncoder.matches(rawPassword, account.getPasswordHash())) {
            throw new BusinessException(ErrorCode.AUTH_FAILED);
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
        if (type == null) throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId);

        return switch (type) {
            case STUDENT -> buildStudentDetail(accountId);
            case PROFESSOR -> {
                AdminProfessorDetailResponse dto = accountRepository.findProfessorDetail(accountId);
                if (dto == null) throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId);
                yield dto;
            }
            case ADMIN -> {
                AdminAdminAccountDetailResponse dto = accountRepository.findAdminDetail(accountId);
                if (dto == null) throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId);
                yield dto;
            }
        };
    }

    private AdminStudentDetailResponse buildStudentDetail(Long accountId) {
        AdminStudentDetailResponse base = accountRepository.findStudentBaseDetail(accountId);
        if (base == null) throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId);

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
                .accountId(base.getAccountId())
                .loginId(base.getLoginId())
                .accountType(base.getAccountType())
                .status(base.getStatus())
                .createdAt(base.getCreatedAt())
                .profile(newProfile)
                .build();
    }
    // 내 정보 조회 (간단 버전)
    public com.teamlms.backend.domain.account.api.dto.MyProfileResponse getMyProfile(Long accountId) {
        AccountType type = accountRepository.findAccountTypeById(accountId);
        if (type == null) throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId);

        var builder = com.teamlms.backend.domain.account.api.dto.MyProfileResponse.builder()
            .accountId(accountId);

        if (type == AccountType.STUDENT) {
            studentProfileRepository.findById(accountId).ifPresent(p -> {
                builder.name(p.getName())
                       .email(p.getEmail())
                       .phone(p.getPhone())
                       .studentNo(p.getStudentNo())
                       .gradeLevel(p.getGradeLevel());
                
                if (p.getDeptId() != null) {
                    deptRepository.findById(p.getDeptId())
                        .ifPresent(d -> builder.deptName(d.getDeptName()));
                }
                
                // Primary Major lookup could be added here if needed, but deptName matches modal requirements
            });
        } else if (type == AccountType.PROFESSOR) {
            professorProfileRepository.findById(accountId).ifPresent(p -> {
                 builder.name(p.getName())
                        .email(p.getEmail())
                        .phone(p.getPhone());
                        
                 if (p.getDeptId() != null) {
                    deptRepository.findById(p.getDeptId())
                        .ifPresent(d -> builder.deptName(d.getDeptName()));
                }
            });
        }
        
        return builder.build();
    }
}