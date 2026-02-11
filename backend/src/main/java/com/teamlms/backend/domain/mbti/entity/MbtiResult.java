package com.teamlms.backend.domain.mbti.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mbti_result")
public class MbtiResult extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "mbti_type", nullable = false, length = 10)
    private String mbtiType;

    // Raw scores for each type
    @Column(name = "e_score")
    private int eScore;
    @Column(name = "i_score")
    private int iScore;

    @Column(name = "s_score")
    private int sScore;
    @Column(name = "n_score")
    private int nScore;

    @Column(name = "t_score")
    private int tScore;
    @Column(name = "f_score")
    private int fScore;

    @Column(name = "j_score")
    private int jScore;
    @Column(name = "p_score")
    private int pScore;
}
