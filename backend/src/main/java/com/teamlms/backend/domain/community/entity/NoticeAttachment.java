package com.teamlms.backend.domain.community.entity;
//공지사항 첨부파일
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notice_attachment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class) // 직접 리스너 연결
public class NoticeAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id", nullable = false)
    private Notice notice;

    @Column(name = "storage_key", nullable = false, unique = true)
    private String storageKey;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    // --- Custom Audit Mapping ---
    @CreatedDate
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @CreatedBy
    @Column(name = "uploaded_by", nullable = false, updatable = false)
    private Long uploadedBy; // Account ID

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by", nullable = false)
    private Long updatedBy; // Account ID

    @Builder
    public NoticeAttachment(Notice notice, String storageKey, String originalName, String contentType, Long fileSize) {
        this.notice = notice;
        this.storageKey = storageKey;
        this.originalName = originalName;
        this.contentType = contentType;
        this.fileSize = fileSize;
    }
}