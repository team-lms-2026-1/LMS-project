package com.teamlms.backend.domain.authorization.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.authorization.entity.AuthAccountRole;
import com.teamlms.backend.domain.authorization.entity.AuthAccountRoleId;
import com.teamlms.backend.domain.authorization.entity.AuthRole;
import com.teamlms.backend.domain.authorization.repository.AuthAccountRoleRepository;
import com.teamlms.backend.domain.authorization.repository.AuthRoleRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class DefaultRoleAssignerService {

    private final AuthRoleRepository authRoleRepository;
    private final AuthAccountRoleRepository authAccountRoleRepository;
    private final AccountRepository accountRepository;

    /**
     * 계정 생성 직후, accountType에 맞는 "기본 Role"을 자동 부여한다.
     *
     * @param accountId      생성된 계정 ID
     * @param accountType    계정 타입 (STUDENT/PROFESSOR/ADMIN)
     * @param actorAccountId 생성자(관리자) 계정 ID (없으면 null 가능)
     */
    public void assignDefaultRole(Long accountId, AccountType accountType, Long actorAccountId) {
        String defaultRoleCode = defaultRoleCodeOf(accountType);

        AuthRole role = authRoleRepository.findByCode(defaultRoleCode)
                .orElseThrow(() -> new IllegalStateException("기본 Role이 DB에 없습니다. roleCode=" + defaultRoleCode));

        if (Boolean.FALSE.equals(role.getIsActive())) {
            throw new IllegalStateException("기본 Role이 비활성화 상태입니다. roleCode=" + defaultRoleCode);
        }

        AuthAccountRoleId id = new AuthAccountRoleId(accountId, role.getRoleId());

        // 이미 있으면 중복 부여 방지 (정책: 무시)
        if (authAccountRoleRepository.existsById(id)) {
            return;
        }

        Account accountRef = accountRepository.getReferenceById(accountId);
        Account assignedByRef = (actorAccountId == null) ? null : accountRepository.getReferenceById(actorAccountId);

        AuthAccountRole mapping = AuthAccountRole.builder()
                .id(id)
                .account(accountRef)
                .role(role)
                .assignedAt(LocalDateTime.now())
                .assignedBy(assignedByRef)
                .build();

        authAccountRoleRepository.save(mapping);
    }

    /**
     * A안: 코드 상수 매핑 (최소 정책)
     */
    private String defaultRoleCodeOf(AccountType type) {
        return switch (type) {
            case STUDENT -> "STUDENT_BASIC";
            case PROFESSOR -> "PROFESSOR_BASIC";
            case ADMIN -> "ADMIN_SYSTEM";
        };
    }
}
