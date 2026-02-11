package com.teamlms.backend.domain.mentoring.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentoring_answer")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class MentoringAnswer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long answerId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    // writerId and createdAt are handled by BaseEntity
}
