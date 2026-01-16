package com.teamlms.backend.global.security.jwt;

import com.teamlms.backend.global.security.principal.AuthUser;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                Claims claims = jwtTokenProvider.parseClaims(token);

                Long accountId = Long.valueOf(claims.getSubject());
                String accountType = String.valueOf(claims.get("accountType"));

                // ✅ 1) role(계정타입) authority
                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + accountType));

                // ✅ 2) permission authority (JWT claim에서 꺼냄)
                // - JWT에 Set<String> 넣어도 꺼낼 때는 보통 List로 나옴
                List<String> permissions = claims.get("permissions", List.class);
                if (permissions != null) {
                    for (String p : permissions) {
                        if (p != null && !p.isBlank()) {
                            authorities.add(new SimpleGrantedAuthority(p)); // 예: "DEPT_MANAGE"
                        }
                    }
                }

                AuthUser principal = new AuthUser(accountId, accountType);

                Authentication auth =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }
}
