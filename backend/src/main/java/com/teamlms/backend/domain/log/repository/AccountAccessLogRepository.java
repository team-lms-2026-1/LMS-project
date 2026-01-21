package com.teamlms.backend.domain.log.repository;

import com.teamlms.backend.domain.log.entity.AccountAccessLog;
import com.teamlms.backend.domain.log.repository.projection.AccountAccessLogRow;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * account_access_log 조회/저장
 * - export 용 조회는 기간 조건 + limit 필수(대량 다운로드 방지)
 */
@Repository
public interface AccountAccessLogRepository extends JpaRepository<AccountAccessLog, Long> {

    // 엑셀 export
    @Query(value = """
        SELECT *
        FROM account_access_log
        WHERE accessed_at >= :from AND accessed_at <= :to
        ORDER BY accessed_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<AccountAccessLog> findForExport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("limit") int limit
    );

    @Query(value = """
        SELECT *
        FROM account_access_log
        WHERE account_id = :accountId
          AND accessed_at >= :from AND accessed_at <= :to
        ORDER BY accessed_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<AccountAccessLog> findForExportByAccountId(
            @Param("accountId") Long accountId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("limit") int limit
    );

    // 상세
    @Query(
        value = """
            SELECT
            log_id AS logId,
            accessed_at AS accessedAt,
            access_url AS accessUrl,
            ip AS ip,
            os AS os
            FROM account_access_log
            WHERE account_id = :accountId
            ORDER BY accessed_at DESC
            """,
        countQuery = """
            SELECT COUNT(*)
            FROM account_access_log
            WHERE account_id = :accountId
            """,
        nativeQuery = true
    )
    Page<AccountAccessLogRow> findPageByAccountId(
            @Param("accountId") Long accountId,
            Pageable pageable
    );


}
