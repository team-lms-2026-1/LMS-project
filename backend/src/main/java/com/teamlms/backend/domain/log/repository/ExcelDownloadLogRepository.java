package com.teamlms.backend.domain.log.repository;

import com.teamlms.backend.domain.log.entity.ExcelDownloadLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * excel_download_log insert-only
 */
@Repository
public interface ExcelDownloadLogRepository extends JpaRepository<ExcelDownloadLog, Long> {
}
