package com.teamlms.backend.global.security;

import com.teamlms.backend.global.security.jwt.JwtAuthenticationFilter;
import com.teamlms.backend.global.security.jwt.JwtTokenProvider;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // permission 기반 권한체크
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider) throws Exception {

        http.csrf(csrf -> csrf.disable());
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.formLogin(f -> f.disable());
        http.httpBasic(b -> b.disable());

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/error").permitAll()
                .requestMatchers("/health").permitAll()

                //auth
                .requestMatchers("/api/v1/auth/login").permitAll()
                .requestMatchers("/api/v1/auth/password-reset/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/v1/auth/me").authenticated()

                //role-based
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/professor/**").hasRole("PROFESSOR")
                .requestMatchers("/api/v1/student/**").hasRole("STUDENT")

                //그 외는 인증필요
                .anyRequest().authenticated()
        );

        http.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
