package com.teamlms.backend.domain.mbti.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.mbti.api.dto.MbtiResultResponse;
import com.teamlms.backend.domain.mbti.dto.MbtiSubmitCommand;
import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import com.teamlms.backend.domain.mbti.enums.MbtiDimension;
import com.teamlms.backend.domain.mbti.repository.MbtiChoiceRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiJobRecommendationRepository;
import com.teamlms.backend.domain.mbti.repository.MbtiResultRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class MbtiCommandServiceTest {

    @InjectMocks
    private MbtiCommandService mbtiCommandService;

    @Mock
    private MbtiChoiceRepository choiceRepository;

    @Mock
    private MbtiResultRepository resultRepository;

    @Mock
    private MbtiJobRecommendationRepository recommendationRepository;

    @Test
    @DisplayName("MBTI 제출 정상 작동 (E, S, T, J 유형 도출)")
    void submitMbti_Success() {
        // given
        Long accountId = 1L;
        List<Long> choiceIds = Arrays.asList(1L, 2L, 3L, 4L);
        MbtiSubmitCommand command = new MbtiSubmitCommand(accountId, choiceIds);

        // Mock questions & choices to yield ESTJ
        MbtiQuestion q1 = MbtiQuestion.builder().dimension(MbtiDimension.EI).build();
        MbtiQuestion q2 = MbtiQuestion.builder().dimension(MbtiDimension.SN).build();
        MbtiQuestion q3 = MbtiQuestion.builder().dimension(MbtiDimension.TF).build();
        MbtiQuestion q4 = MbtiQuestion.builder().dimension(MbtiDimension.JP).build();

        MbtiChoice c1 = MbtiChoice.builder().question(q1).scoreA(3).scoreB(0).build(); // E
        MbtiChoice c2 = MbtiChoice.builder().question(q2).scoreA(3).scoreB(0).build(); // S
        MbtiChoice c3 = MbtiChoice.builder().question(q3).scoreA(3).scoreB(0).build(); // T
        MbtiChoice c4 = MbtiChoice.builder().question(q4).scoreA(3).scoreB(0).build(); // J

        when(choiceRepository.findAllById(choiceIds)).thenReturn(Arrays.asList(c1, c2, c3, c4));

        MbtiResult savedResult = MbtiResult.builder()
                .accountId(accountId).mbtiType("ESTJ")
                .eScore(3).iScore(0).sScore(3).nScore(0)
                .tScore(3).fScore(0).jScore(3).pScore(0)
                .build();
        ReflectionTestUtils.setField(savedResult, "resultId", 100L);

        when(resultRepository.save(any(MbtiResult.class))).thenReturn(savedResult);

        // when
        MbtiResultResponse response = mbtiCommandService.submitMbti(command);

        // then
        assertEquals("ESTJ", response.mbtiType());
        assertEquals(3, response.score().e());
        verify(recommendationRepository, times(1)).deleteByAccountId(accountId);
        verify(resultRepository, times(1)).save(any(MbtiResult.class));
    }

    @Test
    @DisplayName("MBTI 제출 실패 - 명령어 혹은 계정 ID 누락")
    void submitMbti_Fail_NullCommandOrAccountId() {
        MbtiSubmitCommand command1 = null;
        MbtiSubmitCommand command2 = new MbtiSubmitCommand(null, Arrays.asList(1L, 2L));

        assertThrows(BusinessException.class, () -> mbtiCommandService.submitMbti(command1));
        assertThrows(BusinessException.class, () -> mbtiCommandService.submitMbti(command2));
    }

    @Test
    @DisplayName("MBTI 제출 실패 - 선택 항목 유실 혹은 DB 미존재")
    void submitMbti_Fail_ChoicesMismatch() {
        Long accountId = 1L;
        List<Long> choiceIds = Arrays.asList(1L, 2L);
        MbtiSubmitCommand command = new MbtiSubmitCommand(accountId, choiceIds);

        MbtiChoice c1 = MbtiChoice.builder().scoreA(1).scoreB(0).build();
        // DB returns only 1 choice instead of 2
        when(choiceRepository.findAllById(choiceIds)).thenReturn(List.of(c1));

        assertThrows(BusinessException.class, () -> mbtiCommandService.submitMbti(command));
    }
}
