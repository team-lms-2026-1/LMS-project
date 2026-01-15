package com.teamlms.backend.domain.career;

import com.teamlms.backend.domain.account.entity.Account; // 👈 import 수정됨
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_test_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserTestHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    // 🔴 수정된 부분: User -> Account로 변경
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id") // Account의 PK 컬럼명과 매칭
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_seq")
    private CareerTest careerTest;

    @Column(columnDefinition = "TEXT")
    private String scoreSummary; // 결과 요약 (JSON 혹은 텍스트)

    @CreationTimestamp
    private LocalDateTime testDate;
}