package com.teamlms.backend.domain.survey.repository;

import com.teamlms.backend.domain.survey.api.dto.SurveyListResponse;
import com.teamlms.backend.domain.survey.enums.SurveyStatus;
import com.teamlms.backend.domain.survey.enums.SurveyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class SurveyRepositoryImpl implements SurveyRepositoryCustom {

    private final EntityManager em;

    @Override
    public Page<SurveyListResponse> findSurveyAdminList(
            SurveyType type,
            SurveyStatus status,
            String keyword,
            Pageable pageable
    ) {
        String baseJpql = "from Survey s";

        StringBuilder where = new StringBuilder(" where 1=1 ");
        if (type != null) {
            where.append(" and s.type = :type");
        }
        if (status != null) {
            where.append(" and s.status = :status");
        }
        if (keyword != null && !keyword.isBlank()) {
            where.append(" and lower(s.title) like :kw");
        }

        // status dynamic logic: if current time is outside range -> CLOSED
        String contentJpql = """
            select new com.teamlms.backend.domain.survey.api.dto.SurveyListResponse(
                s.id,
                s.type,
                s.title,
                case 
                    when :now < s.startAt or :now > s.endAt then com.teamlms.backend.domain.survey.enums.SurveyStatus.CLOSED 
                    else s.status 
                end,
                s.startAt,
                s.endAt,
                s.viewCount,
                s.createdAt
            )
            """ + baseJpql + where.toString() + " order by s.id desc";

        TypedQuery<SurveyListResponse> contentQuery = em.createQuery(contentJpql, SurveyListResponse.class);

        LocalDateTime now = LocalDateTime.now();
        contentQuery.setParameter("now", now);

        setParams(contentQuery, type, status, keyword);
        contentQuery.setFirstResult((int) pageable.getOffset());
        contentQuery.setMaxResults(pageable.getPageSize());

        List<SurveyListResponse> content = contentQuery.getResultList();

        // Count
        String countJpql = "select count(s.id) " + baseJpql + where.toString();
        TypedQuery<Long> countQuery = em.createQuery(countJpql, Long.class);
        setParams(countQuery, type, status, keyword);

        long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    @Override
    public List<SurveyListResponse> findAvailableSurveysForUser(Long userId, String keyword) {
        // Condition: User is in Target (Pending) + Survey.
        
        String jpql = """
            select new com.teamlms.backend.domain.survey.api.dto.SurveyListResponse(
                s.id,
                s.type,
                s.title,
                case 
                    when :now < s.startAt or :now > s.endAt then com.teamlms.backend.domain.survey.enums.SurveyStatus.CLOSED 
                    else s.status 
                end,
                s.startAt,
                s.endAt,
                s.viewCount,
                s.createdAt
            )
            from Survey s
            join SurveyTarget t on t.surveyId = s.id
            where t.targetAccountId = :userId
            and t.status = com.teamlms.backend.domain.survey.enums.SurveyTargetStatus.PENDING
            """;

        if (keyword != null && !keyword.isBlank()) {
            jpql += " and lower(s.title) like :kw";
        }

        jpql += " order by s.id desc";

        TypedQuery<SurveyListResponse> query = em.createQuery(jpql, SurveyListResponse.class);
        query.setParameter("userId", userId);
        query.setParameter("now", LocalDateTime.now());

        if (keyword != null && !keyword.isBlank()) {
            query.setParameter("kw", "%" + keyword.toLowerCase() + "%");
        }

        return query.getResultList();
    }

    private void setParams(TypedQuery<?> query, SurveyType type, SurveyStatus status, String keyword) {
        if (type != null) {
            query.setParameter("type", type);
        }
        if (status != null) {
            query.setParameter("status", status);
        }
        if (keyword != null && !keyword.isBlank()) {
            query.setParameter("kw", "%" + keyword.toLowerCase() + "%");
        }
    }
}
