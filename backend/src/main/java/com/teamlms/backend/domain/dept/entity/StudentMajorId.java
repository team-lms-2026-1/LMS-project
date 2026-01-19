package com.teamlms.backend.domain.dept.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

// student_major의 pk가 이렇게 생겼다 라고만 알려줌
@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class StudentMajorId implements Serializable {

    @Column(name = "student_account_id")
    private Long studentAccountId;

    @Column(name = "major_id")
    private Long majorId;
}
