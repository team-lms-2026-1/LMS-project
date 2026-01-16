package com.teamlms.backend.domain.account.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.teamlms.backend.domain.account.api.dto.AdminAccountListItem;
import com.teamlms.backend.domain.account.enums.AccountType;

public interface AccountRepositoryCustom {
    Page<AdminAccountListItem> searchAccounts(
        String keyword,
        AccountType accountType,
        Pageable pageable
    );
}
