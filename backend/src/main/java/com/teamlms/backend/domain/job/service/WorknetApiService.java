package com.teamlms.backend.domain.job.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamlms.backend.domain.job.*;
import com.teamlms.backend.domain.job.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.teamlms.backend.domain.job.repository.JobDictionaryRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorknetApiService {

    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository;
    private final JobDictionaryRepository jobDictionaryRepository;

    @Value("${api.worknet.key}")
    private String authKey;

    @Value("${api.worknet.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. 채용공고 및 관련 기업 정보 수집
    @Transactional
    public void fetchAndSavePostings() {
        log.info(">>> 워크넷 채용공고 수집 시작");

        // API 호출 URL 생성 (JSON 반환 필수)
        URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/wantedApi.do")
                .queryParam("authKey", authKey)
                .queryParam("returnType", "JSON")
                .queryParam("callTp", "L")
                .queryParam("startPage", 1)
                .queryParam("display", 100) // 100개씩 가져오기
                .build()
                .toUri();

        try {
            String response = restTemplate.getForObject(uri, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("wantedRoot").path("wanted");

            if (items.isMissingNode() || items.isEmpty()) {
                log.warn("데이터가 없거나 API 호출 실패");
                return;
            }

            for (JsonNode item : items) {
                savePostingData(item);
            }
            log.info(">>> 채용공고 수집 완료");

        } catch (Exception e) {
            log.error("API 호출 중 에러 발생", e);
        }
    }

    // 개별 공고 및 기업 저장 로직
    private void savePostingData(JsonNode item) {
        String wantedAuthNo = item.path("wantedAuthNo").asText();
        String busino = item.path("busino").asText(); // 사업자번호
        String jobCode = item.path("jobsCd").asText(); // 직업코드

        // 1. 기업 정보 저장/조회 (FK 연결을 위해 필수)
        // 사업자번호가 없는 경우 임의의 ID나 처리가 필요하지만 여기선 건너뜀
        if (busino == null || busino.isEmpty()) return;

        Company company = companyRepository.findByBizNo(busino)
                .orElseGet(() -> {
                    // DB에 없으면 새로 생성 (상세 정보는 별도 API로 채워야 하지만 여기선 기본 정보만)
                    Company newCompany = Company.builder()
                            .bizNo(busino)
                            .companyName(item.path("coNm").asText())
                            .companyType("일반") // 기본값
                            .build();
                    return companyRepository.save(newCompany);
                });

        // 2. 직업 정보 조회 (FK) - 직업사전이 미리 채워져 있어야 함 (없으면 null 처리)
        // (실제로는 JobDictionary를 먼저 수집해두는 스케줄러가 필요함)
        Optional<JobDictionary> jobDict = jobDictionaryRepository.findById(jobCode);

        // 3. 채용공고 저장
        JobPosting posting = JobPosting.builder()
                .postingId(wantedAuthNo)
                .company(company)
                .jobDictionary(jobDict.orElse(null)) // 직업코드 매칭 안되면 null
                .title(item.path("title").asText())
                .salaryType(item.path("salTpNm").asText())
                .salaryAmount(item.path("sal").asText())
                .workRegion(item.path("region").asText())
                .minEducation(item.path("minEdubg").asText())
                .regDate(parseDate(item.path("regDt").asText()))
                .closeDate(parseDate(item.path("closeDt").asText()))
                .isActive(true)
                .detailUrl(item.path("wantedInfoUrl").asText())
                .build();

        jobPostingRepository.save(posting);
    }

    // 날짜 파싱 유틸 ("24-01-01" or "20240101" 등 포맷 확인 필요)
    private LocalDate parseDate(String dateStr) {
        try {
            // 워크넷은 보통 yy-MM-dd 형태를 줌 (예: 24-01-01)
            // 4자리 연도라면 "yyyy-MM-dd" 사용
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yy-MM-dd"));
        } catch (Exception e) {
            return LocalDate.now(); // 파싱 실패 시 현재 날짜 (임시)
        }
    }
}