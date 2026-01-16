package com.teamlms.backend.global.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Set;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenSeconds;

    public JwtTokenProvider(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-token-seconds:3600}") long accessTokenSeconds
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenSeconds = accessTokenSeconds;
    }

    public String createAccessToken(Long accountId, String accountType, Set<String> permissionCodes) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(accessTokenSeconds);

        return Jwts.builder()
                .setSubject(String.valueOf(accountId))
                .claim("accountType", accountType)
                .claim("permissions", permissionCodes)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody();
    }

    public long getAccessTokenSeconds() {
        return accessTokenSeconds;
    }
}
