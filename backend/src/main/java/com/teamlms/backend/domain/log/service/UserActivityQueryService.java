package com.teamlms.backend.domain.log.service;

import com.teamlms.backend.domain.log.api.dto.UserActivityListItem;
import com.teamlms.backend.domain.log.api.dto.UserActivitySummary;
import com.teamlms.backend.domain.log.api.dto.UserAccessLogDetailResponse;
import com.teamlms.backend.domain.log.repository.AccountAccessLogRepository;
import com.teamlms.backend.domain.log.repository.UserActivityListRepository;
import com.teamlms.backend.domain.log.repository.projection.AccountAccessLogRow;
import com.teamlms.backend.domain.log.repository.projection.UserActivityRow;
import com.teamlms.backend.domain.log.repository.projection.UserActivitySummaryRow;
import com.teamlms.backend.domain.log.repository.projection.UserHeaderRow;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserActivityQueryService {

    private final UserActivityListRepository userActivityListRepository;
    private final AccountAccessLogRepository accountAccessLogRepository;

    public Page<UserActivityListItem> list(String keyword, Pageable pageable) {

        Page<UserActivityRow> rows =
                userActivityListRepository.findUserActivityRows(keyword, pageable);

        return rows.map(r -> new UserActivityListItem(
                r.getAccountId(),
                r.getLoginId(),
                r.getAccountType(),
                r.getName(),
                r.getLastActivityAt(),
                Boolean.TRUE.equals(r.getIsOnline())
        ));
    }

    public UserActivitySummary summary(String keyword) {
        UserActivitySummaryRow row = userActivityListRepository.findSummary(keyword);

        long total = (row == null || row.getTotalAccounts() == null) ? 0L : row.getTotalAccounts();
        long online = (row == null || row.getOnlineAccounts() == null) ? 0L : row.getOnlineAccounts();

        return new UserActivitySummary(total, online);
    }
    /**
     * 접근 로그 상세 (헤더 + 아이템 + meta용 page)
     * - 사용 레포: UserActivityListRepository + AccountAccessLogRepository (2개)
     */
    public AccessLogDetailResult accessLogsDetail(Long accountId, Pageable pageable) {

        UserHeaderRow headerRow = userActivityListRepository.findHeaderByAccountId(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, accountId));

        Page<AccountAccessLogRow> logPage =
                accountAccessLogRepository.findPageByAccountId(accountId, pageable);

        UserAccessLogDetailResponse.Header header =
                new UserAccessLogDetailResponse.Header(
                        headerRow.getAccountId(),
                        headerRow.getLoginId(),
                        headerRow.getAccountType(),
                        headerRow.getName()
                );

        List<UserAccessLogDetailResponse.Item> items =
                logPage.map(r -> new UserAccessLogDetailResponse.Item(
                        r.getLogId(),
                        r.getAccessedAt(),
                        r.getAccessUrl(),
                        r.getIp(),
                        r.getOs()
                )).getContent();

        UserAccessLogDetailResponse data = new UserAccessLogDetailResponse(header, items);

        return new AccessLogDetailResult(data, logPage);
    }

    public record AccessLogDetailResult(
            UserAccessLogDetailResponse data,
            Page<AccountAccessLogRow> page
    ) {}
}
