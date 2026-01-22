package com.teamlms.backend.domain.mentoring.qna;

import com.teamlms.backend.domain.mentoring.batch.*;
import com.teamlms.backend.domain.mentoring.qna.dto.*;
import com.teamlms.backend.global.error.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentoringQnaService {

    private final MentoringMatchingRepository matchingRepository;
    private final MentoringQnaMessageRepository messageRepository;

    public Page<QnaRoomListItem> rooms(Long recruitmentId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "id"));

        // matching을 페이지로 뽑기 위해 findAll + filter를 간단히 구현 (데이터 많으면 MatchingRepo에 query로 개선 권장)
        Page<MentoringMatching> matchPage = new PageImpl<>(
                matchingRepository.findAll().stream()
                        .filter(m -> m.getRecruitment().getId().equals(recruitmentId))
                        .toList(),
                pageable,
                matchingRepository.findAll().stream().filter(m -> m.getRecruitment().getId().equals(recruitmentId)).count()
        );

        return matchPage.map(m -> {
            long answerCount = messageRepository.countAnswers(m.getId());
            LocalDateTime last = messageRepository.lastMessageAt(m.getId());
            QnaRoomStatus status = messageRepository.lastMessageType(m.getId())
                    .map(t -> t == QnaMessageType.QUESTION ? QnaRoomStatus.ANSWER_PENDING : QnaRoomStatus.ANSWERED)
                    .orElse(QnaRoomStatus.ANSWER_PENDING);

            var menteeApp = m.getMenteeApplication();
            var mentorApp = m.getMentorApplication();

            return new QnaRoomListItem(
                    m.getId(),
                    Map.of(
                            "accountId", menteeApp.getAccountId(),
                            "name", menteeApp.getName(),
                            "department", menteeApp.getDepartment(),
                            "grade", menteeApp.getGrade()
                    ),
                    Map.of(
                            "accountId", mentorApp.getAccountId(),
                            "name", mentorApp.getName(),
                            "department", mentorApp.getDepartment()
                    ),
                    answerCount,
                    status,
                    last
            );
        });
    }

    public QnaRoomDetailResponse roomDetail(Long matchingId) {
        MentoringMatching m = matchingRepository.findById(matchingId)
                .orElseThrow(() -> new BizException("MATCHING_NOT_FOUND", "매칭 정보를 찾을 수 없습니다."));

        QnaRoomStatus status = messageRepository.lastMessageType(matchingId)
                .map(t -> t == QnaMessageType.QUESTION ? QnaRoomStatus.ANSWER_PENDING : QnaRoomStatus.ANSWERED)
                .orElse(QnaRoomStatus.ANSWER_PENDING);

        var menteeApp = m.getMenteeApplication();
        var mentorApp = m.getMentorApplication();

        var messages = messageRepository.findTimeline(matchingId).stream()
                .map(msg -> Map.<String, Object>of(
                        "type", msg.getType().name(),
                        (msg.getType() == QnaMessageType.QUESTION ? "questionId" : "answerId"), msg.getId(),
                        "authorAccountId", msg.getAuthorAccountId(),
                        "content", msg.getContent(),
                        "createdAt", msg.getCreatedAt()
                ))
                .toList();

        return new QnaRoomDetailResponse(
                m.getId(),
                m.getRecruitment().getId(),
                Map.of(
                        "accountId", menteeApp.getAccountId(),
                        "name", menteeApp.getName(),
                        "department", menteeApp.getDepartment(),
                        "grade", menteeApp.getGrade()
                ),
                Map.of(
                        "accountId", mentorApp.getAccountId(),
                        "name", mentorApp.getName(),
                        "department", mentorApp.getDepartment()
                ),
                status,
                messages
        );
    }
}
