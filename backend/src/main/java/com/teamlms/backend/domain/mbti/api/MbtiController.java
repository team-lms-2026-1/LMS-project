package com.teamlms.backend.domain.mbti.api;

import com.teamlms.backend.domain.mbti.api.dto.MbtiQuestionResponse;
import com.teamlms.backend.domain.mbti.api.dto.MbtiResultResponse;
import com.teamlms.backend.domain.mbti.api.dto.MbtiSubmitRequest;
import com.teamlms.backend.domain.mbti.dto.MbtiQuestionDto;
import com.teamlms.backend.domain.mbti.dto.MbtiResultDto;
import com.teamlms.backend.domain.mbti.dto.MbtiSubmitCommand;
import com.teamlms.backend.domain.mbti.service.MbtiService;
import com.teamlms.backend.global.api.ApiResponse;
import com.teamlms.backend.global.security.principal.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "MBTI", description = "MBTI 테스트 API")
@RestController
@RequestMapping("/api/v1/student/mbti")
@RequiredArgsConstructor
public class MbtiController {

    private final MbtiService mbtiService;

    @Operation(summary = "문항 조회", description = "MBTI 테스트 문항 전체를 조회합니다.")
    @GetMapping("/questions")
    public ApiResponse<List<MbtiQuestionResponse>> getQuestions() {
        List<MbtiQuestionDto> questionDtos = mbtiService.getAllQuestions();
        List<MbtiQuestionResponse> response = questionDtos.stream()
                .map(MbtiQuestionResponse::from)
                .collect(Collectors.toList());
        return ApiResponse.ok(response);
    }

    @Operation(summary = "결과 제출", description = "MBTI 테스트 결과를 제출하고 유형을 판정받습니다.")
    @PostMapping("/submit")
    public ApiResponse<MbtiResultResponse> submitMbti(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestBody MbtiSubmitRequest request) {
        MbtiSubmitCommand command = request.toCommand(authUser.getAccountId());
        MbtiResultDto resultDto = mbtiService.submitMbti(command);
        return ApiResponse.ok(MbtiResultResponse.from(resultDto));
    }

    @Operation(summary = "최근 결과 조회", description = "사용자의 최근 MBTI 결과를 조회합니다.")
    @GetMapping("/result")
    public ApiResponse<MbtiResultResponse> getLatestResult(@AuthenticationPrincipal AuthUser authUser) {
        MbtiResultDto resultDto = mbtiService.getLatestResult(authUser.getAccountId());
        return ApiResponse.ok(resultDto != null ? MbtiResultResponse.from(resultDto) : null);
    }
}
