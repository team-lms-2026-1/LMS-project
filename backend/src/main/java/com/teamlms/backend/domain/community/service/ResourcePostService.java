package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.dto.InternalResourceSearchRequest;
import com.teamlms.backend.domain.community.entity.*;
import com.teamlms.backend.domain.community.repository.*;
//에러코드 임포트
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourcePostService {

    private final ResourcePostRepository postRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final ResourceAttachmentRepository attachmentRepository;
    private final AccountRepository accountRepository;

    // 1. 목록 조회 (검색 + 페이징)
    public Page<ExternalResourceResponse> getList(Pageable pageable, Long categoryId, String keyword) {
        // Internal DTO로 검색 조건 포장
        InternalResourceSearchRequest condition = InternalResourceSearchRequest.builder()
                .categoryId(categoryId)
                .keyword(keyword)
                .build();

        // Repository 호출
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

        // 조회수 증가
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

        // 게시글 저장
        ResourcePost post = ResourcePost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(category)
                .author(author)
                .build();

        postRepository.save(post);

        // 첨부파일 저장
        if (files != null && !files.isEmpty()) {
            saveAttachments(files, post);
        }

        return post.getId();
    }

    // 4. 수정 (PATCH: 텍스트 수정 + 파일 삭제 + 새 파일 추가)
    @Transactional
    public void update(Long resourceId, ExternalResourcePatchRequest request, List<MultipartFile> newFiles, Long modifierId) {
        ResourcePost post = postRepository.findById(resourceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        // 4-1. 텍스트 정보 수정 (값이 있는 경우에만)
        if (request.getCategoryId() != null) {
            ResourceCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_CATEGORY));
            post.changeCategory(category);
        }
        if (request.getTitle() != null) post.changeTitle(request.getTitle());
        if (request.getContent() != null) post.changeContent(request.getContent());

        // 4-2. 기존 파일 삭제 (삭제할 ID 목록이 있는 경우)
        if (request.getDeleteFileIds() != null && !request.getDeleteFileIds().isEmpty()) {
            // TODO: 실제 S3 또는 로컬 스토리지 파일 삭제 로직 추가 필요
            // fileService.delete(storageKey); 
            
            attachmentRepository.deleteAllById(request.getDeleteFileIds());
        }

        // 4-3. 새 파일 추가
        if (newFiles != null && !newFiles.isEmpty()) {
            saveAttachments(newFiles, post);
        }
    }

    // 5. 삭제
    @Transactional
    public void delete(Long resourceId) {
        // CascadeType.ALL 설정 덕분에 첨부파일 메타데이터도 자동 삭제됨
        postRepository.deleteById(resourceId);
    }

    // =================================================================
    // Helper Methods
    // =================================================================

    // 파일 저장 로직
    private void saveAttachments(List<MultipartFile> files, ResourcePost post) {
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String originalName = file.getOriginalFilename();
            // 임시 키 생성 (실제 구현 시 S3 URL이나 UUID 경로 사용)
            String storageKey = UUID.randomUUID().toString() + "_" + originalName;

            ResourceAttachment attachment = ResourceAttachment.builder()
                    .resourcePost(post)
                    .storageKey(storageKey)
                    .originalName(originalName)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .build();

            attachmentRepository.save(attachment);
        }
    }

    // Entity -> DTO 변환 로직
    private ExternalResourceResponse toResponse(ResourcePost entity) {
        // 카테고리 정보 변환
        ExternalCategoryResponse categoryDto = ExternalCategoryResponse.builder()
                .categoryId(entity.getCategory().getId())
                .name(entity.getCategory().getName())
                .bgColorHex(entity.getCategory().getBgColorHex())
                .textColorHex(entity.getCategory().getTextColorHex())
                .build();

        // 첨부파일 목록 변환
        List<ExternalAttachmentResponse> filesDto = entity.getAttachments().stream()
                .map(f -> ExternalAttachmentResponse.builder()
                        .attachmentId(f.getId())
                        .originalName(f.getOriginalName())
                        .contentType(f.getContentType())
                        .fileSize(f.getFileSize())
                        .downloadUrl("/api/community/files/" + f.getStorageKey()) // 다운로드 URL 예시
                        .build())
                .collect(Collectors.toList());

        return ExternalResourceResponse.builder()
                .resourceId(entity.getId())
                .category(categoryDto) // 중첩 DTO
                .title(entity.getTitle())
                .content(entity.getContent())
                // author가 Lazy Loading이므로 ID나 이름을 가져올 때 쿼리가 실행될 수 있음
                .authorName(entity.getAuthor().getAccountId().toString()) // 임시 (실제론 이름 getter 사용)
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .files(filesDto)
                .build();
    }
}