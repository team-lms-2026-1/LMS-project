package com.teamlms.backend.domain.dept.repository;

import com.teamlms.backend.domain.dept.entity.StudentMajor;
import com.teamlms.backend.domain.dept.entity.StudentMajorId;
import com.teamlms.backend.domain.dept.enums.MajorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentMajorRepository extends JpaRepository<StudentMajor, StudentMajorId> {

    List<StudentMajor> findAllByIdStudentAccountId(Long studentAccountId);

    List<StudentMajor> findAllByIdMajorId(Long majorId);

    Optional<StudentMajor> findByIdStudentAccountIdAndMajorType(Long studentAccountId, MajorType majorType);

    boolean existsByIdStudentAccountIdAndIdMajorId(Long studentAccountId, Long majorId);

    void deleteByIdStudentAccountId(Long studentAccountId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from StudentMajor sm where sm.id.studentAccountId = :studentAccountId")
    void deleteAllByStudentAccountId(@Param("studentAccountId") Long studentAccountId);
}
