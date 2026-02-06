package com.teamlms.backend.domain.mypage.entity;

import com.teamlms.backend.domain.account.enums.AcademicStatus;
import com.teamlms.backend.domain.mypage.dto.TimetableInfo;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
// import java.util.Map;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Immutable
@Table(name = "view_student_mypage_summary")
public class StudentMypageSummary {

    @Id
    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "student_no")
    private String studentNo;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "dept_name")
    private String deptName;

    @Column(name = "grade_level")
    private Integer gradeLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_status")
    private AcademicStatus academicStatus;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "total_credits")
    private Long totalCredits;

    @Column(name = "average_score")
    private BigDecimal averageScore;

    @Column(name = "total_extra_points")
    private Long totalExtraPoints;

    @Column(name = "total_extra_hours")
    private Long totalExtraHours;

    /**
     * JSON for the current semester's timetable.
     * List of objects:
     * {
     * "offering_name": "...",
     * "course_code": "...",
     * "day_of_week": "MONDAY",
     * "period": 1,
     * "location": "...",
     * "professor_name": "..."
     * }
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "current_timetable_json", columnDefinition = "jsonb")
    private List<TimetableInfo> currentTimetableJson;
}
