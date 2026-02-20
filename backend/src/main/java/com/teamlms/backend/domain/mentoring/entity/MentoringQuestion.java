package com.teamlms.backend.domain.mentoring.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentoring_question")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class MentoringQuestion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "matching_id", nullable = false)
    private Long matchingId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    // writerId and createdAt are handled by BaseEntity
}
