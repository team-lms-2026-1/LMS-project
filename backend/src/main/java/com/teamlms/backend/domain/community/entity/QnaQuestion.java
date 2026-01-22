package com.teamlms.backend.domain.community.entity;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "qna_question")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QnaQuestion extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private QnaCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_account_id", nullable = false)
    private Account author;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    // 질문 하나에 답변 하나 (1:1)                                                             (추가)
    @OneToOne(mappedBy = "question", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private QnaAnswer answer;

    @Builder
    public QnaQuestion(QnaCategory category, Account author, String title, String content) {
        this.category = category;
        this.author = author;
        this.title = title;
        this.content = content;
    }

    public void increaseViewCount() { //추가
        this.viewCount++;
    }

    public void removeAnswer() {
        this.answer = null;
    }

    public void update(QnaCategory category, String title, String content) {
        if (category != null) this.category = category;
        if (title != null) this.title = title;
        if (content != null) this.content = content;
    }
}