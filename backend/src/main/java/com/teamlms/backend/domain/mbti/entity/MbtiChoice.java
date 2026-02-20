package com.teamlms.backend.domain.mbti.entity;

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
@Table(name = "mbti_choice")
public class MbtiChoice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "choice_id")
    private Long choiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private MbtiQuestion question;

    @Column(nullable = false)
    private String content;

    @Column(name = "score_a", nullable = false)
    @Builder.Default
    private Integer scoreA = 0;

    @Column(name = "score_b", nullable = false)
    @Builder.Default
    private Integer scoreB = 0;

    @Builder.Default
    @OneToMany(mappedBy = "choice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MbtiChoiceI18n> i18nContents = new ArrayList<>();

    public void setQuestion(MbtiQuestion question) {
        this.question = question;
    }

    /**
     * 주어진 locale에 해당하는 다국어 내용 조회
     * @param locale locale code (ko, en, ja)
     * @return locale에 해당하는 내용, 없으면 기본 content 반환
     */
    public String getContentByLocale(String locale) {
        return i18nContents.stream()
            .filter(i18n -> i18n.getLocale().equals(locale))
            .map(MbtiChoiceI18n::getContent)
            .findFirst()
            .orElse(this.content);
    }
}
