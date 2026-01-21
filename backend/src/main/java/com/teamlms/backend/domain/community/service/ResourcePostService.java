package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.dto.InternalResourceSearchRequest;
import com.teamlms.backend.domain.community.entity.*;
import com.teamlms.backend.domain.community.repository.*;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;
// ★ S3Service 추가
import com.teamlms.backend.global.s3.S3Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 로그용
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException; // 예외 처리용
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j // 로그 추가
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourcePostService {

    private final ResourcePostRepository postRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final ResourceAttachmentRepository attachmentRepository;
    private final AccountRepository accountRepository;
    
    // ★ S3Service 주입
    private final S3Service s3Service;

    // 1. 목록 조회 (검색 + 페이징)
    public Page<ExternalResourceResponse> getList(Pageable pageable, Long categoryId, String keyword) {
        InternalResourceSearchRequest condition = InternalResourceSearchRequest.builder()
                .categoryId(categoryId)
                .keyword(keyword)
                .build();

        Page<ResourcePost> posts = postRepository.findBySearchCondition(
                condition.getCategoryId(), 
                condition.getKeyword(), 
                pageable
        );
        
        return posts.map(this::toResponse);
    }

    // 2. 상세 조회
    @Transactional
    public ExternalResourceResponse getDetail(Long resourceId) {
        ResourcePost post = postRepository.findById(resourceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        post.increaseViewCount();

        return toResponse(post);
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

        // 첨부파일 저장 (author 정보도 같이 넘겨줌)
        if (files != null && !files.isEmpty()) {
            saveAttachments(files, post, author);
        }

        return post.getId();
    }

    // 4. 수정
    @Transactional
    public void update(Long resourceId, ExternalResourcePatchRequest request, List<MultipartFile> newFiles, Long modifierId) {
        ResourcePost post = postRepository.findById(resourceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        // 4-1. 텍스트 정보 수정
        if (request.getCategoryId() != null) {
            ResourceCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_CATEGORY));
            post.changeCategory(category);
        }
        if (request.getTitle() != null) post.changeTitle(request.getTitle());
        if (request.getContent() != null) post.changeContent(request.getContent());

        // 4-2. 기존 파일 삭제
        if (request.getDeleteFileIds() != null && !request.getDeleteFileIds().isEmpty()) {
            // S3에서도 파일 삭제 (선택 사항)
             List<ResourceAttachment> attachmentsToDelete = attachmentRepository.findAllById(request.getDeleteFileIds());
             for (ResourceAttachment att : attachmentsToDelete) {
                 s3Service.delete(att.getStorageKey()); // S3 삭제
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
        
        // 게시글 삭제 전 S3 파일들 삭제 (선택)
        // for (ResourceAttachment att : post.getAttachments()) {
        //    s3Service.delete(att.getStorageKey());
        // }

        postRepository.deleteById(resourceId);
    }

    // =================================================================
    // Helper Methods
    // =================================================================

    // ★ 파일 저장 로직 (S3 적용 및 Account 정보 추가)
    private void saveAttachments(List<MultipartFile> files, ResourcePost post, Account author) {
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            try {
                // 1. S3에 실제 업로드 수행 (폴더명: resources)
                String s3Url = s3Service.upload(file, "resources");

                // 2. DB에 메타데이터 저장
                ResourceAttachment attachment = ResourceAttachment.builder()
                        .resourcePost(post)
                        .storageKey(s3Url) // S3 URL 저장
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

    // Entity -> DTO 변환 로직
    private ExternalResourceResponse toResponse(ResourcePost entity) {
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
                        // 스토리지 키가 곧 URL이 됨
                        .downloadUrl(f.getStorageKey()) 
                        .build())
                .collect(Collectors.toList());

        return ExternalResourceResponse.builder()
                .resourceId(entity.getId())
                .category(categoryDto)
                .title(entity.getTitle())
                .content(entity.getContent())
                .authorName(entity.getAuthor().getLoginId()) // ID 대신 LoginId 권장
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .files(filesDto)
                .build();
    }
}