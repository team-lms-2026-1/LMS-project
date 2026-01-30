package com.teamlms.backend.domain.curricular.repository;

import java.util.List;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.teamlms.backend.domain.curricular.entity.Curricular;
import com.teamlms.backend.domain.curricular.entity.QCurricular;

import jakarta.persistence.EntityManager;

public class CurricularRepositoryImpl implements CurricularRepositoryCustom  {
    
    private final JPAQueryFactory queryFactory;

    public CurricularRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public List<Curricular> findActiveByDeptIdForDropdown(Long deptId) {
        QCurricular c = QCurricular.curricular;

        return queryFactory
                .selectFrom(c)
                .where(
                        c.deptId.eq(deptId),
                        c.isActive.isTrue()
                )
                .orderBy(c.curricularName.asc())     // or code.asc()
                .fetch();
    }
}
