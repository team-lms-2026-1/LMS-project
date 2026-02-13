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

    @Builder.Default
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MbtiQuestionI18n> i18nContents = new ArrayList<>();

    /**
     * 주어진 locale에 해당하는 다국어 내용 조회
     * @param locale locale code (ko, en, ja)
     * @return locale에 해당하는 내용, 없으면 기본 content 반환
     */
    public String getContentByLocale(String locale) {
        return i18nContents.stream()
            .filter(i18n -> i18n.getLocale().equals(locale))
            .map(MbtiQuestionI18n::getContent)
            .findFirst()
            .orElse(this.content);
    }

    /**
     * 선택지 목록 설정
     * @param choices 설정할 선택지 목록
     */
    public void setChoices(List<MbtiChoice> choices) {
        this.choices = choices;
    }

}
