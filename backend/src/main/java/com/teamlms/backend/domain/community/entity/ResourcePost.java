package com.teamlms.backend.domain.community.entity;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resource_post")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResourcePost extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long id;

    // 카테고리 FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ResourceCategory category;

    // 작성자 FK (author_account_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_account_id", nullable = false)
    private Account author;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    // 첨부파일 리스트 (Cascade: 게시글 삭제 시 파일 메타데이터도 삭제)
    @OneToMany(mappedBy = "resourcePost", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResourceAttachment> attachments = new ArrayList<>();

    @Builder
    public ResourcePost(String title, String content, ResourceCategory category, Account author) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.author = author;
    }

    // 조회수 증가
    public void increaseViewCount() {
        this.viewCount++;
    }

    // 수정 편의 메서드 (Service에서 사용)
    public void changeCategory(ResourceCategory category) {
        this.category = category;
    }

    public void changeTitle(String title) {
        this.title = title;
    }

    public void changeContent(String content) {
        this.content = content;
    }
}