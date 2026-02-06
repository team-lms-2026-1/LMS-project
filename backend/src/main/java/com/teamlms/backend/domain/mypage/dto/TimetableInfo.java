package com.teamlms.backend.domain.mypage.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Timetable Item Detail")
public class TimetableInfo {

    @Schema(description = "Offering Name (Curricular Name)")
    @JsonProperty("offering_name")
    private String offeringName;

    @Schema(description = "Course Code")
    @JsonProperty("course_code")
    private String courseCode;

    @Schema(description = "Day of Week")
    @JsonProperty("day_of_week")
    private String dayOfWeek;

    @Schema(description = "Period (1-9)")
    private Integer period;

    @Schema(description = "Classroom Location")
    private String location;

    @Schema(description = "Professor Name")
    @JsonProperty("professor_name")
    private String professorName;
}
