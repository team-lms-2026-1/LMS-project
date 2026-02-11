package com.teamlms.backend.domain.ai.api;

import com.teamlms.backend.domain.ai.dto.AiAskRequest;
import com.teamlms.backend.domain.ai.dto.AiAskResponse;
import com.teamlms.backend.domain.ai.service.AiService;
import com.teamlms.backend.global.api.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/v1/student/ai")
@RequiredArgsConstructor
public class StudentAiController {

    private final AiService aiService;

    @PostMapping("/ask")
    public ApiResponse<AiAskResponse> ask(@Valid @RequestBody AiAskRequest req) {
        return ApiResponse.ok(aiService.ask(req.question()));
    }
    
}
