package com.teamlms.backend.domain.account.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.teamlms.backend.domain.account.entity.ProfessorProfile;
import com.teamlms.backend.domain.account.entity.QProfessorProfile;
import com.teamlms.backend.domain.account.entity.QAccount;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import jakarta.persistence.EntityManager;

import java.util.List;

public class ProfessorProfileRepositoryImpl implements ProfessorProfileRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public ProfessorProfileRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public List<ProfessorProfile> findActiveByDeptIdForDropdown(Long deptId) {
        QProfessorProfile prof = QProfessorProfile.professorProfile;
        QAccount account = QAccount.account;

        return queryFactory
                .selectFrom(prof)
                .join(account).on(account.accountId.eq(prof.accountId))
                .where(
                        prof.deptId.eq(deptId),
                        account.accountType.eq(AccountType.PROFESSOR)
                )       
                .orderBy(prof.name.asc())
                .fetch();
    }
}
