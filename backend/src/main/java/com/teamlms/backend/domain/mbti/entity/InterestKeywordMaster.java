package com.teamlms.backend.domain.mbti.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "interest_keyword_master")
public class InterestKeywordMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String keyword;

    @Column(length = 50)
    private String category;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "interestKeywordMaster", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InterestKeywordMasterI18n> i18nContents = new ArrayList<>();

    /**
     * 주어진 locale에 해당하는 다국어 키워드 조회
     * @param locale locale code (ko, en, ja)
     * @return locale에 해당하는 키워드, 없으면 기본 keyword 반환
     */
    public String getKeywordByLocale(String locale) {
        return i18nContents.stream()
            .filter(i18n -> i18n.getLocale().equals(locale))
            .map(InterestKeywordMasterI18n::getKeyword)
            .findFirst()
            .orElse(this.keyword);
    }

    /**
     * 주어진 locale에 해당하는 다국어 카테고리 조회
     * @param locale locale code (ko, en, ja)
     * @return locale에 해당하는 카테고리, 없으면 기본 category 반환
     */
    public String getCategoryByLocale(String locale) {
        return i18nContents.stream()
            .filter(i18n -> i18n.getLocale().equals(locale))
            .map(InterestKeywordMasterI18n::getCategory)
            .findFirst()
            .orElse(this.category);
    }
}
