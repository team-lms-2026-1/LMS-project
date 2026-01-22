package com.teamlms.backend.domain.mentoring.qna;

import com.teamlms.backend.global.api.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mentoring-qna")
public class MentoringQnaController {

    private final com.teamlms.backend.domain.mentoring.semester.SemesterService semesterService;
    private final com.teamlms.backend.domain.mentoring.recruitment.MentoringRecruitmentRepository recruitmentRepository;
    private final MentoringQnaService qnaService;

    @GetMapping("/semesters")
    public ApiResponse<?> semesters() {
        // batch/semesters와 동일하게 반환
        var data = semesterService.getSemesters().stream()
                .map(s -> java.util.Map.<String, Object>of(
                        "semesterId", s.getId(),
                        "year", s.getYear(),
                        "term", s.getTerm()
                ))
                .toList();
        return ApiResponse.ok(data);
    }

    @GetMapping("/recruitments")
    public ApiResponse<?> recruitments(@RequestParam Long semesterId) {
        var data = recruitmentRepository.findAll().stream()
                .filter(r -> r.getSemester().getId().equals(semesterId))
                .map(r -> java.util.Map.<String, Object>of(
                        "recruitmentId", r.getId(),
                        "title", r.getTitle(),
                        "status", r.getStatus().name()
                ))
                .toList();
        return ApiResponse.ok(data);
    }

    @GetMapping("/rooms")
    public ApiResponse<?> rooms(
            @RequestParam Long recruitmentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<?> p = qnaService.rooms(recruitmentId, page, size);

        // 스펙 sort: lastMessageAt,desc 인데 지금은 matchingId desc 기반이야.
        // 필요하면 Matching + Message 조인/서브쿼리로 최적화 가능.
        PageMeta meta = PageMeta.from(p);
        return ApiResponse.ok(p.getContent(), meta);
    }

    @GetMapping("/rooms/{matchingId}")
    public ApiResponse<?> roomDetail(@PathVariable Long matchingId) {
        return ApiResponse.ok(qnaService.roomDetail(matchingId));
    }
}
