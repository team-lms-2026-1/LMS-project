package com.teamlms.backend.domain.dept.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import com.teamlms.backend.domain.dept.api.dto.DeptListItem;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.entity.QDept;
import com.teamlms.backend.domain.dept.entity.QMajor;
import com.teamlms.backend.domain.dept.entity.QStudentMajor;

import com.teamlms.backend.domain.account.entity.QAccount;
import com.teamlms.backend.domain.account.entity.QProfessorProfile;
import com.teamlms.backend.domain.account.entity.QStudentProfile;
import com.teamlms.backend.domain.account.enums.AcademicStatus;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.dept.enums.MajorType;

import jakarta.persistence.EntityManager;

import org.springframework.data.domain.*;
import org.springframework.util.StringUtils;

import java.util.List;

public class DeptRepositoryImpl implements DeptRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QDept dept = QDept.dept;

    public DeptRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public Page<DeptListItem> searchDeptList(String keyword, Pageable pageable) {

        QMajor major = QMajor.major;
        QStudentMajor studentMajor = QStudentMajor.studentMajor;

        QStudentProfile studentProfile = QStudentProfile.studentProfile;

        // professor_profile를 2번 쓰므로 alias 분리
        QProfessorProfile headProf = new QProfessorProfile("headProf"); // 학과장 표시용
        QProfessorProfile deptProf = new QProfessorProfile("deptProf"); // 교수수 집계용

        // 재직교수 필터를 위한 account 조인
        QAccount profAccount = new QAccount("profAccount");

        BooleanExpression cond = keywordCond(keyword, dept);

        // =========================
        // 1) content query
        // =========================
        List<DeptListItem> content = queryFactory
                .select(Projections.constructor(
                        DeptListItem.class,
                        dept.deptId,
                        dept.deptCode,
                        dept.deptName,
                        headProf.name, // null 가능
                        studentProfile.accountId.countDistinct(), // 재학생수 (ENROLLED + PRIMARY)
                        profAccount.accountId.countDistinct(),    // 재직 교수수 (ACTIVE)
                        dept.active
                ))
                .from(dept)

                // 학과장: dept.head_professor_account_id -> professor_profile.account_id
                .leftJoin(headProf).on(headProf.accountId.eq(dept.headProfessorAccountId))

                // -------------------------
                // 교수수: professor_profile(deptProf) -> account(profAccount, ACTIVE)
                // -------------------------
                .leftJoin(deptProf).on(deptProf.deptId.eq(dept.deptId))
                .leftJoin(profAccount).on(
                        profAccount.accountId.eq(deptProf.accountId)
                                .and(profAccount.accountType.eq(AccountType.PROFESSOR))
                                .and(profAccount.status.eq(AccountStatus.ACTIVE))
                )

                // -------------------------
                // 학생수: major -> student_major(PRIMARY) -> student_profile(ENROLLED)
                // - "학과 소속 학생 = 주전공" 이라는 기준
                // -------------------------
                .leftJoin(major).on(major.deptId.eq(dept.deptId))
                .leftJoin(studentMajor).on(
                        studentMajor.id.majorId.eq(major.majorId)
                                .and(studentMajor.majorType.eq(MajorType.PRIMARY))
                )
                .leftJoin(studentProfile).on(
                        studentProfile.accountId.eq(studentMajor.id.studentAccountId)
                                .and(studentProfile.academicStatus.eq(AcademicStatus.ENROLLED))
                )

                .where(cond)
                .groupBy(
                        dept.deptId,
                        dept.deptCode,
                        dept.deptName,
                        dept.active,
                        headProf.name
                )
                .orderBy(toOrderSpecifiers(pageable.getSort(), dept))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // =========================
        // 2) count query (total)
        // =========================
        Long total = queryFactory
                .select(dept.deptId.count())
                .from(dept)
                .where(cond)
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0 : total);
    }

    private BooleanExpression keywordCond(String keyword, QDept dept) {
        if (!StringUtils.hasText(keyword)) return null;
        return dept.deptCode.containsIgnoreCase(keyword)
                .or(dept.deptName.containsIgnoreCase(keyword));
    }

    private com.querydsl.core.types.OrderSpecifier<?>[] toOrderSpecifiers(Sort sort, QDept dept) {
        if (sort == null || sort.isUnsorted()) {
            return new com.querydsl.core.types.OrderSpecifier[]{
                    dept.deptCode.asc()
            };
        }

        return sort.stream().map(order -> {
            boolean asc = order.isAscending();
            String prop = order.getProperty();

            return switch (prop) {
                case "deptCode" -> asc ? dept.deptCode.asc() : dept.deptCode.desc();
                case "deptName" -> asc ? dept.deptName.asc() : dept.deptName.desc();
                case "createdAt" -> asc ? dept.createdAt.asc() : dept.createdAt.desc();
                default -> dept.deptCode.asc();
            };
        }).toArray(com.querydsl.core.types.OrderSpecifier[]::new);
    }

    @Override
    public List<Dept> findActiveForDropdown() {
        return queryFactory
                .selectFrom(dept)
                .where(dept.active.isTrue())
                .orderBy(dept.deptName.asc())
                .fetch();
    }
}
