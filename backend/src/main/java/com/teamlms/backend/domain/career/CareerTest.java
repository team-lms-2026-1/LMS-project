package com.teamlms.backend.domain.career;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "career_tests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CareerTest {

    @Id
    @Column(name = "test_seq", length = 20)
    private String testSeq; // 검사 고유번호 (aplySeq)

    @Column(nullable = false)
    private String testName;

    private String targetGroup; // 대상 (일반/학생)
    private Integer itemCount;  // 문항수

    @Column(columnDefinition = "TEXT")
    private String description;

    private String startUrl;
}