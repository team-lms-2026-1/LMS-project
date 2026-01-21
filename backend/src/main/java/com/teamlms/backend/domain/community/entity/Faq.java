package com.teamlms.backend.domain.community.entity;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "faq")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Faq extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faq_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private FaqCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_account_id", nullable = false)
    private Account author;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @Builder
    public Faq(FaqCategory category, Account author, String title, String content) {
        this.category = category;
        this.author = author;
        this.title = title;
        this.content = content;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    // 수정 편의 메서드
    public void changeCategory(FaqCategory category) { this.category = category; }
    public void changeTitle(String title) { this.title = title; }
    public void changeContent(String content) { this.content = content; }
}