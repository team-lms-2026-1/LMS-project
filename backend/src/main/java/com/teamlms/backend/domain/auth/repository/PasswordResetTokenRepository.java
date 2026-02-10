package com.teamlms.backend.domain.auth.repository;

import com.teamlms.backend.domain.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update PasswordResetToken t set t.usedAt = :usedAt where t.accountId = :accountId and t.usedAt is null")
    int markAllUnusedAsUsed(@Param("accountId") Long accountId, @Param("usedAt") LocalDateTime usedAt);
}
