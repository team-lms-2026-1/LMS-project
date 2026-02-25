package com.teamlms.backend.domain.mbti.service;

import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.entity.JobCatalog;
import com.teamlms.backend.domain.mbti.repository.JobCatalogRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MbtiRecommendationCandidateSelector {

    private static final int CANDIDATE_SIZE = 40;

    private final JobCatalogRepository jobCatalogRepository;

    public List<MbtiRecommendationCandidate> selectCandidates(List<InterestKeywordMaster> selectedKeywords) {
        String latestVersion = jobCatalogRepository.findLatestVersion();
        List<JobCatalog> jobs = latestVersion == null
                ? jobCatalogRepository.findAll()
                : jobCatalogRepository.findByVersionOrderByIdAsc(latestVersion);

        if (jobs.size() < 5) {
            throw new BusinessException(ErrorCode.MBTI_JOB_CATALOG_EMPTY);
        }

        List<MbtiRecommendationCandidate> scored = new ArrayList<>();
        for (JobCatalog job : jobs) {
            int score = 0;
            Set<String> matched = new LinkedHashSet<>();
            String searchText = lower(job.getSearchText());
            String jobName = lower(job.getJobName());
            String major = lower(job.getMajorName());
            String middle = lower(job.getMiddleName());
            String minor = lower(job.getMinorName());

            for (InterestKeywordMaster keyword : selectedKeywords) {
                String kw = lower(keyword.getKeyword());
                if (kw.isBlank()) {
                    continue;
                }
                boolean hit = false;
                if (searchText.contains(kw)) {
                    score += 4;
                    hit = true;
                }
                if (jobName.contains(kw)) {
                    score += 5;
                    hit = true;
                }
                if (major.contains(kw) || middle.contains(kw) || minor.contains(kw)) {
                    score += 2;
                    hit = true;
                }
                if (hit) {
                    matched.add(keyword.getKeyword());
                }
            }

            scored.add(new MbtiRecommendationCandidate(job, score, new ArrayList<>(matched)));
        }

        scored.sort(Comparator
                .comparingInt(MbtiRecommendationCandidate::score).reversed()
                .thenComparing((MbtiRecommendationCandidate c) -> c.matchedKeywords().size(), Comparator.reverseOrder())
                .thenComparing(c -> c.job().getId()));

        return scored.subList(0, Math.min(CANDIDATE_SIZE, scored.size()));
    }

    private String lower(String value) {
        return value == null ? "" : value.toLowerCase();
    }
}
