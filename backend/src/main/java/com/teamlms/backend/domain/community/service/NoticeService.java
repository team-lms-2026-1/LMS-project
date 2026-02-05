package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.dto.InternalNoticeRequest; // 명칭 확인 필요
import com.teamlms.backend.domain.community.entity.*;
import com.teamlms.backend.domain.community.enums.NoticeStatus;
import com.teamlms.backend.domain.community.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
import com.teamlms.backend.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
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
    private final CommunityAccountRepository communityAccountRepository;
    private final S3Service s3Service;

    // 1. 목록 조회 (자료실 스타일: Condition 객체 활용)
    public Page<ExternalNoticeResponse> getNoticeList(Pageable pageable, Long categoryId, String keyword) {
        InternalNoticeRequest condition = InternalNoticeRequest.builder()
                .categoryId(categoryId)
                .titleKeyword(keyword) // 리포지토리 쿼리에 맞춰 필드 사용
                .contentKeyword(keyword)
                .build();

        // 리포지토리에 새로 만든 findNotices 메서드 호출
        Page<Notice> notices = noticeRepository.findNotices(
                condition.getCategoryId(),
                condition.getTitleKeyword(),
                pageable);

        // 작성자 실명 맵 생성 (N+1 방지)
        List<Long> authorIds = notices.getContent().stream()
                .map(n -> n.getAuthor().getAccountId())
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> nameMap = communityAccountRepository.findRealNamesMap(authorIds);

        return notices.map(notice -> convertToExternalResponse(notice, nameMap.get(notice.getAuthor().getAccountId())));
    }

    // 2. 상세 조회
    @Transactional
    public ExternalNoticeResponse getNoticeDetail(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        notice.increaseViewCount();
        String authorName = communityAccountRepository.findRealName(notice.getAuthor().getAccountId());
        return convertToExternalResponse(notice, authorName);
    }

    // 3. 등록
    @Transactional
    public Long createNotice(ExternalNoticeRequest request, List<MultipartFile> files, Long authorId) {
        Account author = accountRepository.findById(authorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_AUTHOR_NOT_FOUND));

        NoticeCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_CATEGORY));

        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(category)
                .author(author)
                .displayStartAt(parseDateTime(request.getDisplayStartAt()))
                .displayEndAt(parseDateTime(request.getDisplayEndAt()))
                .build();

        noticeRepository.save(notice);

        if (files != null && !files.isEmpty()) {
            saveAttachments(files, notice, author);
        }

        return notice.getId();
    }

    // // 4. 수정
    // @Transactional
    // public void updateNotice(Long noticeId, ExternalNoticePatchRequest request,
    // List<MultipartFile> newFiles, Long modifierId) {
    // Notice notice = noticeRepository.findById(noticeId)
    // .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

    // // 4-1. 정보 수정
    // if (request.getCategoryId() != null) {
    // NoticeCategory category =
    // categoryRepository.findById(request.getCategoryId())
    // .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_CATEGORY));
    // notice.changeCategory(category); // 엔티티에 changeCategory 메서드 필요
    // }

    // // 자료실 스타일의 필드별 수정
    // if (request.getTitle() != null) notice.changeTitle(request.getTitle());
    // if (request.getContent() != null) notice.changeContent(request.getContent());
    // if (request.getDisplayStartAt() != null)
    // notice.changeDisplayStartAt(parseDateTime(request.getDisplayStartAt()));
    // if (request.getDisplayEndAt() != null)
    // notice.changeDisplayEndAt(parseDateTime(request.getDisplayEndAt()));

    // // 4-2. 파일 삭제
    // if (request.getDeleteFileIds() != null &&
    // !request.getDeleteFileIds().isEmpty()) {
    // List<NoticeAttachment> attachmentsToDelete =
    // attachmentRepository.findAllById(request.getDeleteFileIds());
    // for (NoticeAttachment att : attachmentsToDelete) {
    // s3Service.delete(extractKeyFromUrl(att.getStorageKey()));
    // }
    // attachmentRepository.deleteAllById(request.getDeleteFileIds());
    // }

    // // 4-3. 새 파일 추가
    // if (newFiles != null && !newFiles.isEmpty()) {
    // Account modifier = accountRepository.findById(modifierId)
    // .orElseThrow(() -> new
    // BusinessException(ErrorCode.RESOURCE_AUTHOR_NOT_FOUND));
    // saveAttachments(newFiles, notice, modifier);
    // }
    // }

    // 5. 삭제
    @Transactional
    public void deleteNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        for (NoticeAttachment att : notice.getAttachments()) {
            s3Service.delete(extractKeyFromUrl(att.getStorageKey()));
        }

        noticeRepository.delete(notice);
    }

    // =================================================================
    // 4. 공지사항 수정
    // =================================================================
    @Transactional
    public void updateNotice(Long noticeId, ExternalNoticePatchRequest request, List<MultipartFile> newFiles,
            Long modifierId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        // 4-1. 기본 정보 수정
        if (request.getCategoryId() != null) {
            NoticeCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_CATEGORY));
            notice.changeCategory(category);
        }

        if (request.getTitle() != null)
            notice.changeTitle(request.getTitle());
        if (request.getContent() != null)
            notice.changeContent(request.getContent());

        // 날짜 파싱 로직 (String -> LocalDateTime)
        if (request.getDisplayStartAt() != null) {
            notice.changeDisplayStartAt(LocalDateTime.parse(request.getDisplayStartAt())); // 포맷에 따라 DateTimeFormatter
                                                                                           // 필요할 수 있음
        }
        if (request.getDisplayEndAt() != null) {
            notice.changeDisplayEndAt(LocalDateTime.parse(request.getDisplayEndAt()));
        }

        // 4-2. 파일 삭제 (중요: 보안 검증 추가)
        if (request.getDeleteFileIds() != null && !request.getDeleteFileIds().isEmpty()) {
            List<NoticeAttachment> attachmentsToDelete = attachmentRepository.findAllById(request.getDeleteFileIds());

            for (NoticeAttachment att : attachmentsToDelete) {
                // [보안 검증] 삭제하려는 파일이 현재 수정 중인 공지사항의 파일이 맞는지 확인
                if (!att.getNotice().getId().equals(noticeId)) {
                    continue; // 혹은 예외 발생 (본인 게시글의 파일이 아님)
                }

                // 1. S3 삭제 요청
                String s3Key = extractKeyFromUrl(att.getStorageKey()); // URL에서 키 추출
                s3Service.delete(s3Key);

                // 2. DB 삭제 (loop 안에서 지우거나, 검증된 리스트를 모아서 밖에서 지움)
                attachmentRepository.delete(att);
            }
        }

        // 4-3. 새 파일 추가
        if (newFiles != null && !newFiles.isEmpty()) {
            Account modifier = accountRepository.findById(modifierId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_AUTHOR_NOT_FOUND));

            // saveAttachments 내부 로직은 기존 구현 사용
            saveAttachments(newFiles, notice, modifier);
        }

    }
    // =================================================================
    // Helper Methods
    // =================================================================

    private void saveAttachments(List<MultipartFile> files, Notice notice, Account author) {
        for (MultipartFile file : files) {
            if (file.isEmpty())
                continue;
            try {
                String s3Url = s3Service.upload(file, "notices");
                NoticeAttachment attachment = NoticeAttachment.builder()
                        .notice(notice)
                        .storageKey(s3Url)
                        .originalName(file.getOriginalFilename())
                        .contentType(file.getContentType())
                        .fileSize(file.getSize())
                        .uploadedBy(author.getAccountId())
                        .updatedBy(author.getAccountId())
                        .build();
                attachmentRepository.save(attachment);
            } catch (IOException e) {
                log.error("공지사항 파일 업로드 실패: {}", file.getOriginalFilename(), e);
                throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR);
            }
        }
    }

    private String extractKeyFromUrl(String url) {
        if (url == null || !url.contains("notices/"))
            return url;
        return url.substring(url.indexOf("notices/"));
    }

    private ExternalNoticeResponse convertToExternalResponse(Notice notice, String authorName) {
        LocalDateTime now = LocalDateTime.now();
        NoticeStatus status = NoticeStatus.ONGOING;

        if (notice.getDisplayStartAt() != null && now.isBefore(notice.getDisplayStartAt())) {
            status = NoticeStatus.SCHEDULED;
        } else if (notice.getDisplayEndAt() != null && now.isAfter(notice.getDisplayEndAt())) {
            status = NoticeStatus.ENDED;
        }

        // 1. 카테고리 정보 객체 생성 (배경색, 글자색 포함)
        ExternalNoticeResponse.CategoryInfo categoryDto = ExternalNoticeResponse.CategoryInfo.builder()
                .categoryId(notice.getCategory().getId())
                .name(notice.getCategory().getName())
                .bgColorHex(notice.getCategory().getBgColorHex())
                .textColorHex(notice.getCategory().getTextColorHex())
                .build();

        // 2. 파일 정보 변환
        List<ExternalAttachmentResponse> filesDto = notice.getAttachments().stream()
                .map(f -> ExternalAttachmentResponse.builder()
                        .attachmentId(f.getId())
                        .originalName(f.getOriginalName())
                        .contentType(f.getContentType())
                        .fileSize(f.getFileSize())
                        .downloadUrl(f.getStorageKey())
                        .build())
                .collect(Collectors.toList());

        // 3. 최종 Response 조립
        return ExternalNoticeResponse.builder()
                .noticeId(notice.getId())
                .category(categoryDto)
                .title(notice.getTitle())
                .content(notice.getContent())
                .authorName(authorName != null ? authorName : notice.getAuthor().getLoginId())
                .viewCount(notice.getViewCount())
                .createdAt(notice.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .status(status.getDescription())
                .files(filesDto)
                .build();
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isBlank())
            return null;
        try {
            return LocalDateTime.parse(dateTimeStr);
        } catch (Exception e) {
            return null;
        }
    }
}