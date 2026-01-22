package com.teamlms.backend.domain.mentoring.semester;

import com.teamlms.backend.global.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/semesters")
public class SemesterController {
    private final SemesterService semesterService;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getSemesters() {
        var data = semesterService.getSemesters().stream()
                .map(s -> Map.<String, Object>of(
                        "semesterId", s.getId(),
                        "year", s.getYear(),
                        "term", s.getTerm()
                ))
                .toList();
        return ApiResponse.ok(data);
    }
}
