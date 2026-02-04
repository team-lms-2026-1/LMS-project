package com.teamlms.backend.domain.curricular.api.dto;

public record EnrollListItem(
    Long offeringId,
    String offeringCode,
    String curricularName,
    Integer capacity,
    String professorName,
    String semesterName,
    Integer credit,

    Long enrolledCount,
    String competencyName1,
    String competencyName2
) {}
