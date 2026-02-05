package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.dto.InternalResourceSearchRequest;
import com.teamlms.backend.domain.community.entity.*;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourcePostService {

    private final ResourcePostRepository postRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final ResourceAttachmentRepository attachmentRepository;
    private final AccountRepository accountRepository;
    private final CommunityAccountRepository communityAccountRepository;
    private final S3Service s3Service;

    // 1. 목록 조회
    public Page<ExternalResourceResponse> getList(Pageable pageable, Long categoryId, String keyword) {
        InternalResourceSearchRequest condition = InternalResourceSearchRequest.builder()
                .categoryId(categoryId)
                .keyword(keyword)
                .build();

        Page<ResourcePost> posts = postRepository.findBySearchCondition(
                condition.getCategoryId(),
                condition.getKeyword(),
                pageable);

        // 작성자 실명 맵 생성 (N+1 방지)
        List<Long> authorIds = posts.getContent().stream()
                .map(p -> p.getAuthor().getAccountId())
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> nameMap = communityAccountRepository.findRealNamesMap(authorIds);

        return posts.map(post -> toResponse(post, nameMap.get(post.getAuthor().getAccountId())));
    }

    // 2. 상세 조회
    @Transactional
    public ExternalResourceResponse getDetail(Long resourceId) {
        ResourcePost post = postRepository.findById(resourceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        post.increaseViewCount();

        String authorName = communityAccountRepository.findRealName(post.getAuthor().getAccountId());
        return toResponse(post, authorName);
    }

    // 3. 등록
    @Transactional
    public Long create(ExternalResourceRequest request, List<MultipartFile> files, Long authorId) {
        Account author = accountRepository.findById(authorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_AUTHOR_NOT_FOUND));

        ResourceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_CATEGORY));

        ResourcePost post = ResourcePost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(category)
                .author(author)
                .build();

        postRepository.save(post);

        if (files != null && !files.isEmpty()) {
            saveAttachments(files, post, author);
        }

        return post.getId();
    }

    // 4. 수정
    @Transactional
    public void update(Long resourceId, ExternalResourcePatchRequest request, List<MultipartFile> newFiles,
            Long modifierId) {
        ResourcePost post = postRepository.findById(resourceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        // 4-1. 텍스트 정보 수정
        if (request.getCategoryId() != null) {
            ResourceCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_CATEGORY));
            post.changeCategory(category);
        }
        if (request.getTitle() != null)
            post.changeTitle(request.getTitle());
        if (request.getContent() != null)
            post.changeContent(request.getContent());

        // 4-2. 기존 파일 삭제 (S3 삭제 포함)
        if (request.getDeleteFileIds() != null && !request.getDeleteFileIds().isEmpty()) {
            List<ResourceAttachment> attachmentsToDelete = attachmentRepository.findAllById(request.getDeleteFileIds());

            // ★ S3 파일 삭제 로직 추가
            for (ResourceAttachment att : attachmentsToDelete) {
                String s3Key = extractKeyFromUrl(att.getStorageKey());
                s3Service.delete(s3Key);
            }

            attachmentRepository.deleteAllById(request.getDeleteFileIds());
        }

        // 4-3. 새 파일 추가
        if (newFiles != null && !newFiles.isEmpty()) {
            Account modifier = accountRepository.findById(modifierId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_AUTHOR_NOT_FOUND));
            saveAttachments(newFiles, post, modifier);
        }
    }

    // 5. 삭제
    @Transactional
    public void delete(Long resourceId) {
        ResourcePost post = postRepository.findById(resourceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        // ★ [수정됨] 게시글 삭제 시 S3 파일들도 같이 삭제
        for (ResourceAttachment att : post.getAttachments()) {
            String s3Key = extractKeyFromUrl(att.getStorageKey());
            s3Service.delete(s3Key);
        }

        postRepository.deleteById(resourceId);
    }

    // =================================================================
    // Helper Methods
    // =================================================================

    private void saveAttachments(List<MultipartFile> files, ResourcePost post, Account author) {
        for (MultipartFile file : files) {
            if (file.isEmpty())
                continue;

            try {
                // S3 업로드 (폴더명: resources)
                String s3Url = s3Service.upload(file, "resources");

                ResourceAttachment attachment = ResourceAttachment.builder()
                        .resourcePost(post)
                        .storageKey(s3Url)
                        .originalName(file.getOriginalFilename())
                        .contentType(file.getContentType())
                        .fileSize(file.getSize())
                        .uploadedBy(author.getAccountId())
                        .updatedBy(author.getAccountId())
                        .build();

                attachmentRepository.save(attachment);

            } catch (IOException e) {
                log.error("자료실 파일 업로드 실패: {}", file.getOriginalFilename(), e);
                throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR);
            }
        }
    }

    // ★ [추가] URL에서 S3 Key 추출 (resources/파일명)
    private String extractKeyFromUrl(String url) {
        if (url == null || !url.contains("resources/")) {
            return url;
        }
        return url.substring(url.indexOf("resources/"));
    }

    private ExternalResourceResponse toResponse(ResourcePost entity, String authorName) {
        ExternalCategoryResponse categoryDto = ExternalCategoryResponse.builder()
                .categoryId(entity.getCategory().getId())
                .name(entity.getCategory().getName())
                .bgColorHex(entity.getCategory().getBgColorHex())
                .textColorHex(entity.getCategory().getTextColorHex())
                .build();

        List<ExternalAttachmentResponse> filesDto = entity.getAttachments().stream()
                .map(f -> ExternalAttachmentResponse.builder()
                        .attachmentId(f.getId())
                        .originalName(f.getOriginalName())
                        .contentType(f.getContentType())
                        .fileSize(f.getFileSize())
                        .downloadUrl(f.getStorageKey())
                        .build())
                .collect(Collectors.toList());

        return ExternalResourceResponse.builder()
                .resourceId(entity.getId())
                .category(categoryDto)
                .title(entity.getTitle())
                .content(entity.getContent())
                .authorName(authorName != null ? authorName : entity.getAuthor().getLoginId())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .files(filesDto)
                .build();
    }
}