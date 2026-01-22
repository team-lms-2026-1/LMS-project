package com.teamlms.backend.domain.mentoring.semester;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "semester")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor @Builder
public class Semester {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, length = 10)
    private String term; // "1", "2"
}
