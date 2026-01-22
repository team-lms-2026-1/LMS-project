package com.teamlms.backend.domain.semester.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.enums.Term;

public interface SemesterRepository extends JpaRepository<Semester, Long> {

    boolean existsByYearAndTerm(int year, Term term);
}
