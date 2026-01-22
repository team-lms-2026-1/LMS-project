package com.teamlms.backend.domain.mentoring.qna;

import com.teamlms.backend.domain.mentoring.batch.MentoringMatching;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_qna_message",
       indexes = {
           @Index(name = "idx_qna_matching_created", columnList = "matching_id, createdAt")
       })
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor @Builder
public class MentoringQnaMessage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matching_id")
    private MentoringMatching matching;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QnaMessageType type;

    @Column(nullable = false)
    private Long authorAccountId;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
