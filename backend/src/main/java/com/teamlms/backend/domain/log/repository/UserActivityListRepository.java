package com.teamlms.backend.domain.log.repository;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.log.repository.projection.UserActivityRow;
import com.teamlms.backend.domain.log.repository.projection.UserActivitySummaryRow;
import com.teamlms.backend.domain.log.repository.projection.UserHeaderRow;

import java.util.Optional;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserActivityListRepository extends JpaRepository<Account, Long> {

  @Query(value = """
      SELECT
        a.account_id AS accountId,
        a.login_id AS loginId,
        a.account_type AS accountType,

        COALESCE(sp.name, pp.name, ap.name) AS name,
        ua.last_activity_at AS lastActivityAt,
        (ua.last_activity_at IS NOT NULL AND ua.last_activity_at >= (now() - interval '5 minutes')) AS isOnline

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
      """, countQuery = """
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
      """, nativeQuery = true)
  Page<UserActivityRow> findUserActivityRows(
      @Param("keyword") String keyword,
      Pageable pageable);

  // 상세 헤더 단건 조회
  @Query(value = """
      SELECT
        a.account_id AS accountId,
        a.login_id AS loginId,
        a.account_type AS accountType,
        COALESCE(sp.name, pp.name, ap.name) AS name
      FROM account a
      LEFT JOIN student_profile sp ON a.account_id = sp.account_id
      LEFT JOIN professor_profile pp ON a.account_id = pp.account_id
      LEFT JOIN admin_profile ap ON a.account_id = ap.account_id
      WHERE a.account_id = :accountId
      LIMIT 1
      """, nativeQuery = true)
  Optional<UserHeaderRow> findHeaderByAccountId(@Param("accountId") Long accountId);

  // 학과 정보 조회 (성능 최적화 및 안정성 보강 버전)
  @Query(value = """
      SELECT d.dept_name
      FROM dept d
      WHERE d.dept_id = (
          SELECT COALESCE(
              (SELECT sp.dept_id FROM student_profile sp WHERE sp.account_id = :accountId),
              (SELECT pp.dept_id FROM professor_profile pp WHERE pp.account_id = :accountId)
          )
      )
      LIMIT 1
      """, nativeQuery = true)
  Optional<String> findDepartmentNameByAccountId(@Param("accountId") Long accountId);

  // 요약정보 조회
  @Query(value = """
      SELECT
      COUNT(*) AS totalAccounts,
      COUNT(*) FILTER (
          WHERE ua.last_activity_at IS NOT NULL
          AND ua.last_activity_at >= (now() - interval '5 minutes')
      ) AS onlineAccounts
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
      """, nativeQuery = true)
  UserActivitySummaryRow findSummary(@Param("keyword") String keyword);
}
