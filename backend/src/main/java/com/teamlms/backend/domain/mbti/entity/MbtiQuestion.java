package com.teamlms.backend.domain.mbti.entity;

import com.teamlms.backend.domain.mbti.enums.MbtiDimension;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mbti_question")
public class MbtiQuestion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MbtiDimension dimension;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Builder.Default
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MbtiChoice> choices = new ArrayList<>();

}
