package com.teamlms.backend.domain.community.entity;

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
@Table(name = "resource_attachment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class) // JPA Auditing 활성화
public class ResourceAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    private Long id;

    // 게시글 FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private ResourcePost resourcePost;

    @Column(name = "storage_key", nullable = false, unique = true)
    private String storageKey;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    // --- Audit Fields (SQL 컬럼명 매핑) ---
    
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
    public ResourceAttachment(ResourcePost resourcePost, String storageKey, String originalName, String contentType, Long fileSize) {
        this.resourcePost = resourcePost;
        this.storageKey = storageKey;
        this.originalName = originalName;
        this.contentType = contentType;
        this.fileSize = fileSize;
    }
}