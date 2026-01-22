package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.community.entity.NoticeAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeAttachmentRepository extends JpaRepository<NoticeAttachment, Long> {
    
    // 기본 CRUD(저장, 삭제, ID로 조회)는 JpaRepository가 자동으로 제공하므로
    // 추가 코드가 없어도 됩니다.
}