package com.teamlms.backend.domain.mentoring.qna;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MentoringQnaMessageRepository extends JpaRepository<MentoringQnaMessage, Long> {

    @Query("""
        select count(m)
        from MentoringQnaMessage m
        where m.matching.id = :matchingId
          and m.type = 'ANSWER'
    """)
    long countAnswers(@Param("matchingId") Long matchingId);

    @Query("""
        select max(m.createdAt)
        from MentoringQnaMessage m
        where m.matching.id = :matchingId
    """)
    LocalDateTime lastMessageAt(@Param("matchingId") Long matchingId);

    @Query("""
        select m
        from MentoringQnaMessage m
        where m.matching.id = :matchingId
        order by m.createdAt asc
    """)
    List<MentoringQnaMessage> findTimeline(@Param("matchingId") Long matchingId);

    @Query("""
        select m.type
        from MentoringQnaMessage m
        where m.matching.id = :matchingId
          and m.createdAt = (
             select max(mm.createdAt) from MentoringQnaMessage mm where mm.matching.id = :matchingId
          )
    """)
    Optional<QnaMessageType> lastMessageType(@Param("matchingId") Long matchingId);
}
