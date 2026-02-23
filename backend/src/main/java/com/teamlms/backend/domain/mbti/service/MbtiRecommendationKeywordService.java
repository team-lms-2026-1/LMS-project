package com.teamlms.backend.domain.mbti.service;

import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.repository.InterestKeywordMasterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MbtiRecommendationKeywordService {

    private final InterestKeywordMasterRepository keywordRepository;

    public List<InterestKeywordMaster> getActiveInterestKeywords() {
        return keywordRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    public List<InterestKeywordMaster> getValidatedKeywords(List<Long> keywordIds) {
        if (keywordIds == null || keywordIds.size() < 2) {
            throw new BusinessException(ErrorCode.MBTI_KEYWORD_MIN_REQUIRED);
        }
        LinkedHashSet<Long> dedup = keywordIds.stream().filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        if (dedup.size() < 2) {
            throw new BusinessException(ErrorCode.MBTI_KEYWORD_MIN_REQUIRED);
        }
        List<InterestKeywordMaster> found = keywordRepository.findByIdInAndActiveTrue(dedup);
        if (found.size() != dedup.size()) {
            throw new BusinessException(ErrorCode.MBTI_KEYWORD_INVALID);
        }

        Map<Long, InterestKeywordMaster> map = found.stream()
                .collect(java.util.stream.Collectors.toMap(InterestKeywordMaster::getId, v -> v));
        List<InterestKeywordMaster> ordered = new ArrayList<>();
        for (Long id : dedup) {
            InterestKeywordMaster keyword = map.get(id);
            if (keyword == null) {
                throw new BusinessException(ErrorCode.MBTI_KEYWORD_INVALID);
            }
            ordered.add(keyword);
        }
        return ordered;
    }

    public List<InterestKeywordMaster> getKeywordsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<InterestKeywordMaster> found = keywordRepository.findByIdInAndActiveTrue(ids);
        Map<Long, InterestKeywordMaster> map = found.stream()
                .collect(java.util.stream.Collectors.toMap(InterestKeywordMaster::getId, v -> v));
        List<InterestKeywordMaster> ordered = new ArrayList<>();
        for (Long id : ids) {
            InterestKeywordMaster keyword = map.get(id);
            if (keyword != null) {
                ordered.add(keyword);
            }
        }
        return ordered;
    }
}
