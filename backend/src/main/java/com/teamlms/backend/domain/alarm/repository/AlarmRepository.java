package com.teamlms.backend.domain.alarm.repository;

import com.teamlms.backend.domain.alarm.entity.Alarm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    Page<Alarm> findByRecipientAccountId(Long recipientAccountId, Pageable pageable);

    Optional<Alarm> findByAlarmIdAndRecipientAccountId(Long alarmId, Long recipientAccountId);

    long countByRecipientAccountIdAndReadAtIsNull(Long recipientAccountId);

    @Modifying
    @Query("""
        update Alarm a
        set a.readAt = :now
        where a.recipientAccountId = :recipientAccountId
          and a.readAt is null
        """)
    int markAllRead(@Param("recipientAccountId") Long recipientAccountId, @Param("now") LocalDateTime now);
}
