package com.teamlms.backend.domain.dept.repository;

import java.util.List;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.entity.QMajor;

import jakarta.persistence.EntityManager;

public class MajorRepositoryImpl implements MajorRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QMajor major = QMajor.major;

    public MajorRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public List<Major> findActiveForDropdownByDeptId(Long deptId) {
        return queryFactory
                .selectFrom(major)
                .where(
                    major.deptId.eq(deptId),
                    major.active.isTrue()
                )
                .orderBy(major.majorName.asc())
                .fetch();
    }
}
