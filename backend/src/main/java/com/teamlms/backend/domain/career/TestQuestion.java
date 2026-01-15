package com.teamlms.backend.domain.career;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "test_questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TestQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_seq")
    private CareerTest careerTest;

    private Integer qItemNo; // 문항 번호

    @Column(columnDefinition = "TEXT")
    private String questionText;

    // 답변 보기 (JSON 저장)
    // 예: [{"text": "그렇다", "score": "5"}, {"text": "아니다", "score": "1"}]
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> answerOptions;
}