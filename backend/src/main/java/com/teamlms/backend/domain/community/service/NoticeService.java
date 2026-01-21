package com.teamlms.backend.domain.community.service;

// 1. 타 도메인
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;

// 2. External DTO
import com.teamlms.backend.domain.community.api.dto.*;

// 3. Internal DTO
import com.teamlms.backend.domain.community.dto.*;

// 4. Entity
import com.teamlms.backend.domain.community.entity.Notice;
import com.teamlms.backend.domain.community.entity.NoticeAttachment;
import com.teamlms.backend.domain.community.entity.NoticeCategory;

// 5. Enums
import com.teamlms.backend.domain.community.enums.NoticeStatus;

// 6. Repository
import com.teamlms.backend.domain.community.repository.*;

// ★ 7. S3 Service 및 예외 처리 추가
import com.teamlms.backend.global.s3.S3Service;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException; // IO 예외 추가
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
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
    
    // ★ S3Service 주입
    private final S3Service s3Service;

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

        // 첨부파일 저장 (S3 업로드 포함)
        if (files != null && !files.isEmpty()) {
            // ★ author 정보를 같이 넘겨야 uploaded_by를 채울 수 있습니다.
            saveAttachments(files, savedNotice, author);
        }

        return savedNotice.getId();
    }

    // =================================================================
    // 2. 상세 조회 (Read Detail)
    // =================================================================
    @Transactional
    public ExternalNoticeResponse getNoticeDetail(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        notice.increaseViewCount();
        return convertToExternalResponse(notice);
    }

    // =================================================================
    // 3. 목록 조회 (Read List)
    // =================================================================
    public Page<ExternalNoticeResponse> getNoticeList(Pageable pageable, Long categoryId, String keyword) {
        InternalNoticeRequest searchCondition = InternalNoticeRequest.builder()
                .categoryId(categoryId)
                .titleKeyword(keyword)
                .contentKeyword(keyword)
                .build();
        
        Page<Notice> notices = noticeRepository.findAll(pageable); 
        return notices.map(this::convertToExternalResponse);
    }

    // =================================================================
    // 4. 수정 (Update)
    // =================================================================
    @Transactional
    public void updateNotice(Long noticeId, ExternalNoticeRequest request, Long requesterId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        NoticeCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리 오류"));

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
        
        // TODO: S3에 있는 실제 파일들도 삭제하려면 여기서 s3Service.delete()를 호출해야 함
        
        noticeRepository.delete(notice);
    }

    // =================================================================
    //  내부 헬퍼 메서드
    // =================================================================

    // ★ 파일 저장 (S3 적용 버전)
    private void saveAttachments(List<MultipartFile> files, Notice notice, Account author) {
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            try {
                // 1. S3에 업로드하고 URL 받기 (폴더명: notices)
                String s3Url = s3Service.upload(file, "notices");

                // 2. DB에 저장 (storageKey에 s3Url 저장)
                NoticeAttachment attachment = NoticeAttachment.builder()
                        .notice(notice)
                        .storageKey(s3Url)             // S3 URL 저장
                        .originalName(file.getOriginalFilename())
                        .contentType(file.getContentType())
                        .fileSize(file.getSize())
                        // ★ DB 스키마에 필수(NOT NULL)인 업로더 정보 설정
                        .uploadedBy(author)  
                        .updatedBy(author)
                        .build();

                attachmentRepository.save(attachment);

            } catch (IOException e) {
                // 업로드 실패 시 비즈니스 예외로 감싸서 던짐 (트랜잭션 롤백 유도)
                log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
                throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR);
            }
        }
    }

    // Entity -> Response DTO 변환
    private ExternalNoticeResponse convertToExternalResponse(Notice notice) {
        LocalDateTime now = LocalDateTime.now();
        NoticeStatus status = NoticeStatus.ONGOING;

        if (notice.getDisplayStartAt() != null && now.isBefore(notice.getDisplayStartAt())) {
            status = NoticeStatus.SCHEDULED;
        } else if (notice.getDisplayEndAt() != null && now.isAfter(notice.getDisplayEndAt())) {
            status = NoticeStatus.ENDED;
        }

        List<ExternalAttachmentResponse> fileResponses = notice.getAttachments().stream()
                .map(file -> ExternalAttachmentResponse.builder()
                        .attachmentId(file.getId())
                        .originalName(file.getOriginalName())
                        .contentType(file.getContentType())
                        .fileSize(file.getFileSize())
                        .uploadedAt(formatDateTime(file.getUploadedAt()))
                        // storageKey가 이미 S3 Full URL이므로 그대로 내려주거나, 필요 시 가공
                        .downloadUrl(file.getStorageKey()) 
                        .build())
                .collect(Collectors.toList());

        return ExternalNoticeResponse.builder()
                .noticeId(notice.getId())
                .categoryName(notice.getCategory().getName())
                .title(notice.getTitle())
                .content(notice.getContent())
                .authorName(notice.getAuthor().getLoginId()) // getAccountId() -> getLoginId() 권장
                .viewCount(notice.getViewCount())
                .createdAt(formatDateTime(notice.getCreatedAt()))
                .status(status.getDescription())
                .files(fileResponses)
                .build();
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isBlank()) return null;
        try { return LocalDateTime.parse(dateTimeStr); } catch (Exception e) { return null; }
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
}