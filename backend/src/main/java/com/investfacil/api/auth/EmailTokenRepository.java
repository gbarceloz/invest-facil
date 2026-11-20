package com.investfacil.api.auth;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface EmailTokenRepository extends JpaRepository<EmailToken, UUID> {

    Optional<EmailToken> findByTokenHashAndType(String tokenHash, EmailTokenType type);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from EmailToken t where t.tokenHash = :hash and t.type = :type")
    Optional<EmailToken> findByTokenHashAndTypeForUpdate(@Param("hash") String hash,
                                                         @Param("type") EmailTokenType type);

    @Modifying
    @Query("update EmailToken t set t.usedAt = :now "
            + "where t.userId = :userId and t.type = :type and t.usedAt is null")
    int invalidateUnused(@Param("userId") UUID userId, @Param("type") EmailTokenType type,
                         @Param("now") Instant now);
}
