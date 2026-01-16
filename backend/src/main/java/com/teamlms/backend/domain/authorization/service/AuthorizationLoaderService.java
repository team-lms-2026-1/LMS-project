package com.teamlms.backend.domain.authorization.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.authorization.repository.AuthorizationQueryRepository;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthorizationLoaderService {

    private final AuthorizationQueryRepository authorizationQueryRepository;

    /**
     * 계정이 가진 "활성 Permission 코드" 조회
     * 예: DEPT_MANAGE, NOTICE_READ ...
     *
     * - Security에서 hasAuthority('DEPT_MANAGE') 같은 방식으로 쓰려고
     *   permission code를 그대로 authority로 쓰는 전략.
     */
    public Set<String> loadActivePermissionCodes(Long accountId) {
        return authorizationQueryRepository.findActivePermissionCodes(accountId);
    }

    /**
     * (선택) Role code까지 필요하면 사용
     * 예: ADMIN_SYSTEM, STUDENT_BASIC ...
     */
    public Set<String> loadActiveRoleCodes(Long accountId) {
        return authorizationQueryRepository.findActiveRoleCodes(accountId);
    }
}
