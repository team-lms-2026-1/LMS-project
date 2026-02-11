package com.teamlms.backend.domain.mbti.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mbti_choice")
public class MbtiChoice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "choice_id")
    private Long choiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private MbtiQuestion question;

    @Column(nullable = false)
    private String content;

    @Column(name = "score_a", nullable = false)
    @Builder.Default
    private Integer scoreA = 0;

    @Column(name = "score_b", nullable = false)
    @Builder.Default
    private Integer scoreB = 0;

    public void setQuestion(MbtiQuestion question) {
        this.question = question;
    }
}
