package com.teamlms.backend.domain.extracurricular.repository;

import java.util.List;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricular;
import com.teamlms.backend.domain.extracurricular.entity.QExtraCurricular;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ExtraCurricularRepositoryImpl
        implements ExtraCurricularRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<ExtraCurricular> findActiveForDropdown() {
        QExtraCurricular extraCurricular = QExtraCurricular.extraCurricular;

        return queryFactory
                .selectFrom(extraCurricular)
                .where(extraCurricular.isActive.isTrue())
                .orderBy(extraCurricular.extraCurricularName.asc())
                .fetch();
    }
}
