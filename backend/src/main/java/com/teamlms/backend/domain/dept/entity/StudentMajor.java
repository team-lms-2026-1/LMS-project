package com.teamlms.backend.domain.dept.entity;

import com.teamlms.backend.domain.dept.enums.MajorType;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_major")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class StudentMajor extends BaseEntity {

    @EmbeddedId
    private StudentMajorId id;

    @Enumerated(EnumType.STRING)
    @Column(name = "major_type", nullable = false, length = 20)
    private MajorType majorType;

    /* ========= 생성 팩토리 ========= */

    public static StudentMajor of(
            Long studentAccountId,
            Long majorId,
            MajorType majorType
    ) {
        return StudentMajor.builder()
                .id(new StudentMajorId(studentAccountId, majorId))
                .majorType(majorType)
                .build();
    }

    /* ========= domain method ========= */

    public void changeMajorType(MajorType majorType) {
        this.majorType = majorType;
    }
}
