package com.teamlms.backend.domain.account.repository;

import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.teamlms.backend.domain.account.api.dto.AdminAccountListItem;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.entity.QAccount;
import com.teamlms.backend.domain.account.entity.QStudentProfile;
import com.teamlms.backend.domain.account.entity.QProfessorProfile;
import com.teamlms.backend.domain.account.entity.QAdminProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;

import java.util.List;

@RequiredArgsConstructor
public class AccountRepositoryImpl implements AccountRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<AdminAccountListItem> searchAccounts(
            String keyword,
            AccountType accountType,
            Pageable pageable
    ) {

        QAccount a = QAccount.account;
        QStudentProfile sp = QStudentProfile.studentProfile;
        QProfessorProfile pp = QProfessorProfile.professorProfile;
        QAdminProfile ap = QAdminProfile.adminProfile;

        String k = (keyword == null || keyword.isBlank()) ? null : keyword.trim();

        BooleanExpression typeCond =
                accountType == null ? null : a.accountType.eq(accountType);

        // profile별 name/email → coalesce
        Expression<String> nameExpr =
                Expressions.stringTemplate(
                        "coalesce({0},{1},{2})",
                        sp.name, pp.name, ap.name
                );

        Expression<String> emailExpr =
                Expressions.stringTemplate(
                        "coalesce({0},{1},{2})",
                        sp.email, pp.email, ap.email
                );

        BooleanExpression keywordCond =
                k == null ? null :
                        Expressions.booleanTemplate(
                                "{0} like concat('%',{1},'%')",
                                nameExpr, k
                        );

        List<AdminAccountListItem> content =
                queryFactory
                        .select(Projections.constructor(
                                AdminAccountListItem.class,
                                a.accountId,
                                a.loginId,
                                nameExpr,
                                emailExpr,
                                a.accountType,
                                a.status,
                                a.createdAt
                        ))
                        .from(a)
                        .leftJoin(sp).on(sp.account.accountId.eq(a.accountId))
                        .leftJoin(pp).on(pp.account.accountId.eq(a.accountId))
                        .leftJoin(ap).on(ap.account.accountId.eq(a.accountId))
                        .where(typeCond, keywordCond)
                        .orderBy(a.createdAt.desc())
                        .offset(pageable.getOffset())
                        .limit(pageable.getPageSize())
                        .fetch();

        Long total =
                queryFactory
                        .select(a.count())
                        .from(a)
                        .leftJoin(sp).on(sp.account.accountId.eq(a.accountId))
                        .leftJoin(pp).on(pp.account.accountId.eq(a.accountId))
                        .leftJoin(ap).on(ap.account.accountId.eq(a.accountId))
                        .where(typeCond, keywordCond)
                        .fetchOne();

        return new PageImpl<>(
                content, // 실제 데이터 목록
                pageable,  // page, size, sort 정보
                total == null ? 0 : total
        );
    }
}
