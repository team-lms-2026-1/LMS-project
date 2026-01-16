package com.teamlms.backend.domain.community.service;

// 1. 타 도메인
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;

// 2. External DTO (API 통신용 - api/dto 패키지)
import com.teamlms.backend.domain.community.api.dto.*;

// 3. Internal DTO (내부 로직용 - dto 패키지)
import com.teamlms.backend.domain.community.dto.*;

// 4. Entity
import com.teamlms.backend.domain.community.entity.Notice;
import com.teamlms.backend.domain.community.entity.NoticeAttachment;
import com.teamlms.backend.domain.community.entity.NoticeCategory;

// 5. Enums (상태 및 검색 타입)
import com.teamlms.backend.domain.community.enums.NoticeStatus;

// 6. Repository
import com.teamlms.backend.domain.community.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final NoticeCategoryRepository categoryRepository;
    private final NoticeAttachmentRepository attachmentRepository;
    private final AccountRepository accountRepository;

    // =================================================================
    // 1. 등록 (Create)
    // =================================================================
    @Transactional
    public Long createNotice(ExternalNoticeRequest request, List<MultipartFile> files, Long authorId) {
        
        Account author = accountRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        NoticeCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));

        // DTO -> Entity 변환
        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(category)
                .author(author)
                .displayStartAt(parseDateTime(request.getDisplayStartAt()))
                .displayEndAt(parseDateTime(request.getDisplayEndAt()))
                .build();

        Notice savedNotice = noticeRepository.save(notice);

        // 첨부파일 저장
        if (files != null && !files.isEmpty()) {
            saveAttachments(files, savedNotice);
        }

        return savedNotice.getId();
    }

    // =================================================================
    // 2. 상세 조회 (Read Detail)
    // =================================================================
    @Transactional // 조회수 증가를 위해 트랜잭션 필요
    public ExternalNoticeResponse getNoticeDetail(Long noticeId) {
        
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        // 조회수 증가
        notice.increaseViewCount();

        // 변환 (상태 계산 포함)
        return convertToExternalResponse(notice);
    }

    // =================================================================
    // 3. 목록 조회 (Read List)
    // =================================================================
    public Page<ExternalNoticeResponse> getNoticeList(Pageable pageable, Long categoryId, String keyword) {
        
        // 1. 검색 조건을 Internal DTO에 담기
        InternalNoticeRequest searchCondition = InternalNoticeRequest.builder()
                .categoryId(categoryId)
                .titleKeyword(keyword)
                .contentKeyword(keyword)
                .build();
        
        // (참고) 아직 QueryDSL이 없으므로 로그로 확인만 하고 넘어갑니다.
        log.info("목록 조회 요청 - 검색 조건: {}", searchCondition);

        // 2. Repository 호출
        Page<Notice> notices = noticeRepository.findAll(pageable); 

        // 3. 변환하여 반환
        return notices.map(this::convertToExternalResponse);
    }

    // =================================================================
    // 4. 수정 (Update)
    // =================================================================
    @Transactional
    public void updateNotice(Long noticeId, ExternalNoticeRequest request, Long requesterId) {
        
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        // (권한 체크 로직이 필요하다면 여기에 추가)
        
        NoticeCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리 오류"));

        // Entity의 update 메서드 호출 (Dirty Checking으로 자동 저장)
        notice.update(
            request.getTitle(),
            request.getContent(),
            category,
            parseDateTime(request.getDisplayStartAt()),
            parseDateTime(request.getDisplayEndAt())
        );
    }

    // =================================================================
    // 5. 삭제 (Delete)
    // =================================================================
    @Transactional
    public void deleteNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));
        
        // (파일 삭제 로직은 추후 추가)

        noticeRepository.delete(notice);
    }

    // =================================================================
    //  내부 헬퍼 메서드
    // =================================================================

    // 파일 저장
    private void saveAttachments(List<MultipartFile> files, Notice notice) {
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String originalName = file.getOriginalFilename();
            String storageKey = UUID.randomUUID().toString() + "_" + originalName; // 임시 키

            NoticeAttachment attachment = NoticeAttachment.builder()
                    .notice(notice)
                    .storageKey(storageKey)
                    .originalName(originalName)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .build();

            attachmentRepository.save(attachment);
        }
    }

    // Entity -> Response DTO 변환 (상태 계산 로직 포함 ★)
    private ExternalNoticeResponse convertToExternalResponse(Notice notice) {
        
        // 1. 상태 계산 (Enum 활용)
        LocalDateTime now = LocalDateTime.now();
        NoticeStatus status = NoticeStatus.ONGOING; // 기본값

        if (notice.getDisplayStartAt() != null && now.isBefore(notice.getDisplayStartAt())) {
            status = NoticeStatus.SCHEDULED; // 시작일 전이면 예약
        } else if (notice.getDisplayEndAt() != null && now.isAfter(notice.getDisplayEndAt())) {
            status = NoticeStatus.ENDED;     // 종료일 지났으면 종료
        }

        // 2. 파일 목록 변환
        List<ExternalAttachmentResponse> fileResponses = notice.getAttachments().stream()
                .map(file -> ExternalAttachmentResponse.builder()
                        .attachmentId(file.getId())
                        .originalName(file.getOriginalName())
                        .contentType(file.getContentType())
                        .fileSize(file.getFileSize())
                        .uploadedAt(formatDateTime(file.getUploadedAt()))
                        .downloadUrl("/api/community/files/" + file.getStorageKey())
                        .build())
                .collect(Collectors.toList());

        // 3. 최종 매핑
        return ExternalNoticeResponse.builder()
                .noticeId(notice.getId())
                .categoryName(notice.getCategory().getName())
                .title(notice.getTitle())
                .content(notice.getContent())
                .authorName(notice.getAuthor().getAccountId().toString()) // 임시 (이름 getter 필요)
                .viewCount(notice.getViewCount())
                .createdAt(formatDateTime(notice.getCreatedAt()))
                .status(status.getDescription()) // "예약 게시", "게시 중" 등 문자열 입력
                .files(fileResponses)
                .build();
    }

    // 날짜 파싱 (String -> LocalDateTime)
    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isBlank()) return null;
        try {
            return LocalDateTime.parse(dateTimeStr);
        } catch (Exception e) {
            return null;
        }
    }

    // 날짜 포맷팅 (LocalDateTime -> String)
    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
}