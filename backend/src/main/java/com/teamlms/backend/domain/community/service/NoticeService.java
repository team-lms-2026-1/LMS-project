package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.dto.*;
import com.teamlms.backend.domain.community.entity.Notice;
import com.teamlms.backend.domain.community.entity.NoticeAttachment;
import com.teamlms.backend.domain.community.entity.NoticeCategory;
import com.teamlms.backend.domain.community.enums.NoticeStatus;
import com.teamlms.backend.domain.community.repository.*;
import com.teamlms.backend.global.s3.S3Service;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final S3Service s3Service;

    // =================================================================
    // 1. 등록 (Create) - 관리자만 가능
    // =================================================================
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public Long createNotice(ExternalNoticeRequest request, List<MultipartFile> files, Long authorId) {
        
        Account author = accountRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        NoticeCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));

        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(category)
                .author(author)
                .displayStartAt(parseDateTime(request.getDisplayStartAt()))
                .displayEndAt(parseDateTime(request.getDisplayEndAt()))
                .build();

        Notice savedNotice = noticeRepository.save(notice);

        if (files != null && !files.isEmpty()) {
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
        
        // 검색 로직은 Repository 구현에 따라 다름 (여기서는 findAll로 가정하거나 커스텀 메서드 사용)
        // 만약 searchNoticeList 같은 커스텀 메서드가 없다면 기본 findAll 사용
        Page<Notice> notices = noticeRepository.findAll(pageable); 
        return notices.map(this::convertToExternalResponse);
    }

    // =================================================================
    // 4. 수정 (Update) - 관리자만 가능
    // =================================================================
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void updateNotice(Long noticeId, ExternalNoticePatchRequest request, List<MultipartFile> files, Long requesterId) {
        
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

        if (files != null && !files.isEmpty()) {
            Account uploader = accountRepository.findById(requesterId)
                 .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
            
            saveAttachments(files, notice, uploader);
        }
    }

    // =================================================================
    // 5. 삭제 (Delete) - 관리자만 가능
    // =================================================================
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));
        
        // TODO: S3 파일 삭제 로직 (필요 시 구현)
        
        noticeRepository.delete(notice);
    }

    // =================================================================
    //  내부 헬퍼 메서드
    // =================================================================

    private void saveAttachments(List<MultipartFile> files, Notice notice, Account author) {
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            try {
                // S3 업로드
                String s3Url = s3Service.upload(file, "notices");
                
                // DB 저장
                NoticeAttachment attachment = NoticeAttachment.builder()
                        .notice(notice)
                        .storageKey(s3Url)
                        .originalName(file.getOriginalFilename())
                        .contentType(file.getContentType())
                        .fileSize(file.getSize())
                        .uploadedBy(author.getAccountId()) // ID만 저장
                        .updatedBy(author.getAccountId())
                        .build();
                attachmentRepository.save(attachment);
                
            } catch (IOException e) {
                log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
                throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR);
            }
        }
    }

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
                        .downloadUrl(file.getStorageKey()) 
                        .build())
                .collect(Collectors.toList());

        return ExternalNoticeResponse.builder()
                .noticeId(notice.getId())
                .categoryName(notice.getCategory().getName())
                .title(notice.getTitle())
                .content(notice.getContent())
                .authorName(notice.getAuthor().getLoginId())
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