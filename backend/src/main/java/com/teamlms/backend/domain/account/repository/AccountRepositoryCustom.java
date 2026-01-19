package com.teamlms.backend.domain.account.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.account.api.dto.AdminAccountListItem;
import com.teamlms.backend.domain.account.api.dto.AdminAdminAccountDetailResponse;
import com.teamlms.backend.domain.account.api.dto.AdminProfessorDetailResponse;
import com.teamlms.backend.domain.account.api.dto.AdminStudentDetailResponse;
import com.teamlms.backend.domain.account.enums.AccountType;

public interface AccountRepositoryCustom {
    Page<AdminAccountListItem> searchAccounts(
        String keyword,
        AccountType accountType,
        Pageable pageable
    );

    AccountType findAccountTypeById(Long accountId);

    AdminStudentDetailResponse findStudentBaseDetail(Long accountId);
    List<AdminStudentDetailResponse.MajorItem> findStudentMajors(Long studentAccountId);

    AdminProfessorDetailResponse findProfessorDetail(Long accountId);

    AdminAdminAccountDetailResponse findAdminDetail(Long accountId);

}
