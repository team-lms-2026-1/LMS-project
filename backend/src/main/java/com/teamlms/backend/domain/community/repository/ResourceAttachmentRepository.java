package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.ResourceAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceAttachmentRepository extends JpaRepository<ResourceAttachment, Long> {
    
    // 기본 JpaRepository 메서드(save, deleteById, findAllById 등)로 충분합니다.
    // 추후 특정 게시글의 파일만 가져오고 싶다면 아래 메서드 추가 가능:
    // List<ResourceAttachment> findAllByResourcePost_Id(Long resourceId);
}