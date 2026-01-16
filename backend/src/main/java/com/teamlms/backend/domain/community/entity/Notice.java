package com.teamlms.backend.domain.community.entity;
// 공지사항 카테고리
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private NoticeCategory category;

    // 화면에 표시될 작성자 (교수님 등)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_account_id", nullable = false)
    private Account author;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "display_start_at")
    private LocalDateTime displayStartAt;

    @Column(name = "display_end_at")
    private LocalDateTime displayEndAt;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @OneToMany(mappedBy = "notice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NoticeAttachment> attachments = new ArrayList<>();

    @Builder
    public Notice(NoticeCategory category, Account author, String title, String content, LocalDateTime displayStartAt, LocalDateTime displayEndAt) {
        this.category = category;
        this.author = author;
        this.title = title;
        this.content = content;
        this.displayStartAt = displayStartAt;
        this.displayEndAt = displayEndAt;
    }
    
    public void increaseViewCount() {
        this.viewCount++;
    }
    public void update(String title, String content, NoticeCategory category, LocalDateTime displayStartAt, LocalDateTime displayEndAt) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.displayStartAt = displayStartAt;
        this.displayEndAt = displayEndAt;
    }
}