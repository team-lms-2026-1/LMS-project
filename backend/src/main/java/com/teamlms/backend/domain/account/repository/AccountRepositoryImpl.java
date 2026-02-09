package com.teamlms.backend.domain.account.repository;

import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.teamlms.backend.domain.account.api.dto.AdminAccountListItem;
import com.teamlms.backend.domain.account.api.dto.AdminAdminAccountDetailResponse;
import com.teamlms.backend.domain.account.api.dto.AdminProfessorDetailResponse;
import com.teamlms.backend.domain.account.api.dto.AdminStudentDetailResponse;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.dept.entity.QDept;
import com.teamlms.backend.domain.dept.entity.QMajor;
import com.teamlms.backend.domain.dept.entity.QStudentMajor;
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
                        Pageable pageable) {

                QAccount a = QAccount.account;
                QStudentProfile sp = QStudentProfile.studentProfile;
                QProfessorProfile pp = QProfessorProfile.professorProfile;
                QAdminProfile ap = QAdminProfile.adminProfile;

                String k = (keyword == null || keyword.isBlank()) ? null : keyword.trim();

                BooleanExpression typeCond = accountType == null ? null : a.accountType.eq(accountType);

                // profile별 name/email → coalesce
                Expression<String> nameExpr = Expressions.stringTemplate(
                                "coalesce({0},{1},{2})",
                                sp.name, pp.name, ap.name);

                Expression<String> emailExpr = Expressions.stringTemplate(
                                "coalesce({0},{1},{2})",
                                sp.email, pp.email, ap.email);

                BooleanExpression keywordCond = k == null ? null
                                : Expressions.booleanTemplate(
                                                "{0} like concat('%',{1},'%')",
                                                nameExpr, k);

                List<AdminAccountListItem> content = queryFactory
                                .select(Projections.constructor(
                                                AdminAccountListItem.class,
                                                a.accountId,
                                                a.loginId,
                                                nameExpr,
                                                emailExpr,
                                                a.accountType,
                                                a.status,
                                                a.createdAt))
                                .from(a)
                                .leftJoin(sp).on(sp.account.accountId.eq(a.accountId))
                                .leftJoin(pp).on(pp.account.accountId.eq(a.accountId))
                                .leftJoin(ap).on(ap.account.accountId.eq(a.accountId))
                                .where(typeCond, keywordCond)
                                .orderBy(a.createdAt.desc())
                                .offset(pageable.getOffset())
                                .limit(pageable.getPageSize())
                                .fetch();

                Long total = queryFactory
                                .select(a.count())
                                .from(a)
                                .leftJoin(sp).on(sp.account.accountId.eq(a.accountId))
                                .leftJoin(pp).on(pp.account.accountId.eq(a.accountId))
                                .leftJoin(ap).on(ap.account.accountId.eq(a.accountId))
                                .where(typeCond, keywordCond)
                                .fetchOne();

                return new PageImpl<>(
                                content, // 실제 데이터 목록
                                pageable, // page, size, sort 정보
                                total == null ? 0 : total);
        }

        // =========================
        // 0) accountType만 먼저 조회
        // =========================
        @Override
        public AccountType findAccountTypeById(Long accountId) {
                QAccount a = QAccount.account;

                return queryFactory
                                .select(a.accountType)
                                .from(a)
                                .where(a.accountId.eq(accountId))
                                .fetchOne();
        }

        // =========================
        // 1) STUDENT - 기본 상세 (majors는 서비스에서 붙임)
        // =========================
        @Override
        public AdminStudentDetailResponse findStudentBaseDetail(Long accountId) {
                QAccount a = QAccount.account;
                QStudentProfile sp = QStudentProfile.studentProfile;

                return queryFactory
                                .select(Projections.constructor(
                                                AdminStudentDetailResponse.class,
                                                a.accountId, // ✅ DTO accountId로 수정 권장
                                                a.loginId,
                                                a.accountType,
                                                a.status,
                                                a.createdAt,
                                                Projections.constructor(
                                                                AdminStudentDetailResponse.Profile.class,
                                                                sp.name,
                                                                sp.email,
                                                                sp.phone,

                                                                sp.gradeLevel,
                                                                sp.academicStatus,

                                                                // dept, primaryMajor, majors는 여기서 비움 (서비스에서 계산/주입)
                                                                Expressions.nullExpression(
                                                                                AdminStudentDetailResponse.DeptSimple.class),
                                                                Expressions.nullExpression(
                                                                                AdminStudentDetailResponse.MajorSimple.class),
                                                                Expressions.constant(List.of()))))
                                .from(a)
                                .join(sp).on(sp.account.accountId.eq(a.accountId))
                                .where(a.accountId.eq(accountId))
                                .fetchOne();
        }

        // =========================
        // 2) STUDENT - majors 목록
        // =========================
        @Override
        public List<AdminStudentDetailResponse.MajorItem> findStudentMajors(Long studentAccountId) {
                // ⚠️ 아래 Q클래스/필드명은 너희 엔티티에 맞게 수정 필요
                // 예시: StudentMajor(학생-전공 매핑), Major(전공), Dept(학과)

                QStudentMajor sm = QStudentMajor.studentMajor; // 없으면 너희 매핑 엔티티 Q로 변경
                QMajor m = QMajor.major;
                QDept d = QDept.dept;

                return queryFactory
                                .select(Projections.constructor(
                                                AdminStudentDetailResponse.MajorItem.class,
                                                m.majorId,
                                                m.majorName,
                                                Projections.constructor(
                                                                AdminStudentDetailResponse.DeptSimple.class,
                                                                d.deptId,
                                                                d.deptName),
                                                sm.majorType))
                                .from(sm)
                                .join(m).on(m.majorId.eq(sm.id.majorId))
                                .join(d).on(d.deptId.eq(m.deptId))
                                .where(sm.id.studentAccountId.eq(studentAccountId)) // 복합키/필드명에 맞게 수정
                                .orderBy(sm.majorType.asc(), m.majorId.asc())
                                .fetch();
        }

        // =========================
        // 3) PROFESSOR 상세
        // =========================
        @Override
        public AdminProfessorDetailResponse findProfessorDetail(Long accountId) {
                QAccount a = QAccount.account;
                QProfessorProfile pp = QProfessorProfile.professorProfile;
                QDept d = QDept.dept;

                // dept join이 필요하면 여기서 Dept까지 join해서 DeptSimple로 내려도 됨
                // 최소 구현이라 dept는 일단 null로 둬도 OK

                return queryFactory
                                .select(Projections.constructor(
                                                AdminProfessorDetailResponse.class,
                                                a.accountId, // ✅ DTO accountId로 수정 권장
                                                a.loginId,
                                                a.accountType,
                                                a.status,
                                                a.createdAt,
                                                Projections.constructor(
                                                                AdminProfessorDetailResponse.Profile.class,
                                                                pp.name,
                                                                pp.email,
                                                                pp.phone,
                                                                Projections.constructor(
                                                                                AdminProfessorDetailResponse.DeptSimple.class,
                                                                                d.deptId, d.deptName))))
                                .from(a)
                                .join(pp).on(pp.account.accountId.eq(a.accountId))
                                .leftJoin(d).on(d.deptId.eq(pp.deptId))
                                .where(a.accountId.eq(accountId))
                                .fetchOne();
        }

        // =========================
        // 4) ADMIN 상세
        // =========================
        @Override
        public AdminAdminAccountDetailResponse findAdminDetail(Long accountId) {
                QAccount a = QAccount.account;
                QAdminProfile ap = QAdminProfile.adminProfile;

                return queryFactory
                                .select(Projections.constructor(
                                                AdminAdminAccountDetailResponse.class,
                                                a.accountId, // ✅ DTO accountId로 수정 권장
                                                a.loginId,
                                                a.accountType,
                                                a.status,
                                                a.createdAt,
                                                Projections.constructor(
                                                                AdminAdminAccountDetailResponse.Profile.class,
                                                                ap.name,
                                                                ap.email,
                                                                ap.phone,
                                                                ap.memo)))
                                .from(a)
                                .join(ap).on(ap.account.accountId.eq(a.accountId))
                                .where(a.accountId.eq(accountId))
                                .fetchOne();
        }

}