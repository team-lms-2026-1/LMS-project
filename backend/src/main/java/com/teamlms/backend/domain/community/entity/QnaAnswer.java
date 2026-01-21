package com.teamlms.backend.domain.community.entity;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "qna_answer")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QnaAnswer extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private QnaQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_account_id", nullable = false)
    private Account author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder
    public QnaAnswer(QnaQuestion question, Account author, String content) {
        this.question = question;
        this.author = author;
        this.content = content;
    }

    public void update(String content) {
        this.content = content;
    }
}