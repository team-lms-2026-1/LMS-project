package com.teamlms.backend.domain.community.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "faq_category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FaqCategory extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "bg_color_hex", nullable = false, length = 7)
    private String bgColorHex;

    @Column(name = "text_color_hex", nullable = false, length = 7)
    private String textColorHex;

    @Builder
    public FaqCategory(String name, String bgColorHex, String textColorHex) {
        this.name = name;
        this.bgColorHex = bgColorHex;
        this.textColorHex = textColorHex;
    }

    public void update(String name, String bgColorHex, String textColorHex) {
        this.name = name;
        this.bgColorHex = bgColorHex;
        this.textColorHex = textColorHex;
    }
}