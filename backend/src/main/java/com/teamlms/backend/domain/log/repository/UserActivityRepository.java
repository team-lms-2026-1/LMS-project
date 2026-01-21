package com.teamlms.backend.domain.log.repository;

import com.teamlms.backend.domain.log.entity.UserActivity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * user_activity upsert를 위해 Postgres ON CONFLICT native query 사용
 * - 성능/동시성 측면에서 가장 안정적
 */
@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    @Modifying
    @Query(value = """
        INSERT INTO user_activity (
          account_id,
          first_activity_at,
          last_activity_at,
          last_request_path,
          last_ip,
          last_user_agent,
          updated_at
        )
        VALUES (
          :accountId,
          :now,
          :now,
          :path,
          :ip,
          :userAgent,
          :now
        )
        ON CONFLICT (account_id)
        DO UPDATE SET
          last_activity_at = EXCLUDED.last_activity_at,
          last_request_path = EXCLUDED.last_request_path,
          last_ip = EXCLUDED.last_ip,
          last_user_agent = EXCLUDED.last_user_agent,
          updated_at = EXCLUDED.updated_at
        """, nativeQuery = true)
    int upsert(
            @Param("accountId") Long accountId,
            @Param("now") LocalDateTime now,
            @Param("path") String path,
            @Param("ip") String ip,
            @Param("userAgent") String userAgent
    );

}
