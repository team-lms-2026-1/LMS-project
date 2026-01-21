package com.teamlms.backend.domain.log.repository;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.log.repository.projection.UserActivityRow;
import com.teamlms.backend.domain.log.repository.projection.UserHeaderRow;

import java.util.Optional;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserActivityListRepository extends JpaRepository<Account, Long> {

    @Query(
        value = """
            SELECT
              a.account_id AS accountId,
              a.login_id AS loginId,
              a.account_type AS accountType,

              CASE a.account_type
                WHEN 'STUDENT' THEN sp.name
                WHEN 'PROFESSOR' THEN pp.name
                WHEN 'ADMIN' THEN ap.name
              END AS name,

              ua.last_activity_at AS lastActivityAt,

              CASE
                WHEN ua.last_activity_at IS NOT NULL
                 AND ua.last_activity_at >= (now() - interval '5 minutes')
                THEN true
                ELSE false
              END AS isOnline

            FROM account a
            LEFT JOIN user_activity ua
              ON ua.account_id = a.account_id

            LEFT JOIN student_profile sp
              ON sp.account_id = a.account_id
             AND a.account_type = 'STUDENT'

            LEFT JOIN professor_profile pp
              ON pp.account_id = a.account_id
             AND a.account_type = 'PROFESSOR'

            LEFT JOIN admin_profile ap
              ON ap.account_id = a.account_id
             AND a.account_type = 'ADMIN'

            WHERE (:keyword IS NULL OR :keyword = ''
               OR a.login_id ILIKE CONCAT('%', :keyword, '%')
               OR (CASE a.account_type
                    WHEN 'STUDENT' THEN sp.name
                    WHEN 'PROFESSOR' THEN pp.name
                    WHEN 'ADMIN' THEN ap.name
                  END) ILIKE CONCAT('%', :keyword, '%')
            )

            ORDER BY ua.last_activity_at DESC NULLS LAST
            """,
        countQuery = """
            SELECT COUNT(*)
            FROM account a
            LEFT JOIN student_profile sp
              ON sp.account_id = a.account_id
             AND a.account_type = 'STUDENT'
            LEFT JOIN professor_profile pp
              ON pp.account_id = a.account_id
             AND a.account_type = 'PROFESSOR'
            LEFT JOIN admin_profile ap
              ON ap.account_id = a.account_id
             AND a.account_type = 'ADMIN'

            WHERE (:keyword IS NULL OR :keyword = ''
               OR a.login_id ILIKE CONCAT('%', :keyword, '%')
               OR (CASE a.account_type
                    WHEN 'STUDENT' THEN sp.name
                    WHEN 'PROFESSOR' THEN pp.name
                    WHEN 'ADMIN' THEN ap.name
                  END) ILIKE CONCAT('%', :keyword, '%')
            )
            """,
        nativeQuery = true
    )
    Page<UserActivityRow> findUserActivityRows(
            @Param("keyword") String keyword,
            Pageable pageable
    );
    //상세 헤더 단건 조회
    @Query(value = """
        SELECT
          a.account_id AS accountId,
          a.login_id AS loginId,
          a.account_type AS accountType,
          CASE a.account_type
            WHEN 'STUDENT' THEN sp.name
            WHEN 'PROFESSOR' THEN pp.name
            WHEN 'ADMIN' THEN ap.name
          END AS name
        FROM account a
        LEFT JOIN student_profile sp
          ON sp.account_id = a.account_id AND a.account_type = 'STUDENT'
        LEFT JOIN professor_profile pp
          ON pp.account_id = a.account_id AND a.account_type = 'PROFESSOR'
        LEFT JOIN admin_profile ap
          ON ap.account_id = a.account_id AND a.account_type = 'ADMIN'
        WHERE a.account_id = :accountId
        """, nativeQuery = true)
    Optional<UserHeaderRow> findHeaderByAccountId(@Param("accountId") Long accountId);
}
