package com.teamlms.backend.domain.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.entity.AdminProfile;
import com.teamlms.backend.domain.account.entity.ProfessorProfile;
import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.AdminProfileRepository;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.auth.api.dto.AuthMeResponse;
import com.teamlms.backend.global.security.principal.AuthUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthMeService {

    private final AccountRepository accountRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ProfessorProfileRepository professorProfileRepository;
    private final AdminProfileRepository adminProfileRepository;

    public AuthMeResponse getMe(AuthUser authUser) {
        Account account = accountRepository.findById(authUser.getAccountId())
            .orElseThrow(() -> new IllegalStateException("인증된 계정이 존재하지 않습니다."));

        AuthMeResponse.AuthMeResponseBuilder builder = AuthMeResponse.builder()
            .accountId(account.getAccountId())
            .loginId(account.getLoginId())
            .accountType(account.getAccountType().name());

        AccountType type = account.getAccountType();

        if (type == AccountType.STUDENT) {
            StudentProfile p = studentProfileRepository.findById(account.getAccountId())
                .orElseThrow(() -> new IllegalStateException("학생 프로필이 없습니다."));
            return builder.profile(AuthMeResponse.Profile.builder()
                .name(p.getName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .studentNo(p.getStudentNo())
                .gradeLevel(p.getGradeLevel())
                .academicStatus(p.getAcademicStatus().name())
                .build()
            ).build();
        }

        if (type == AccountType.PROFESSOR) {
            ProfessorProfile p = professorProfileRepository.findById(account.getAccountId())
                .orElseThrow(() -> new IllegalStateException("교수 프로필이 없습니다."));
            return builder.profile(AuthMeResponse.Profile.builder()
                .name(p.getName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .professorNo(p.getProfessorNo())
                .deptId(p.getDeptId())
                .build()
            ).build();
        }

        AdminProfile p = adminProfileRepository.findById(account.getAccountId())
            .orElseThrow(() -> new IllegalStateException("관리자 프로필이 없습니다."));
        return builder.profile(AuthMeResponse.Profile.builder()
            .name(p.getName())
            .email(p.getEmail())
            .phone(p.getPhone())
            .build()
        ).build();
    }
}
