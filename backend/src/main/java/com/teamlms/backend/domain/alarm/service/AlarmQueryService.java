package com.teamlms.backend.domain.alarm.service;

import com.teamlms.backend.domain.alarm.api.dto.AlarmResponse;
import com.teamlms.backend.domain.alarm.repository.AlarmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlarmQueryService {

    private final AlarmRepository alarmRepository;

    public Page<AlarmResponse> getMyAlarms(Long accountId, Pageable pageable) {
        return alarmRepository.findByRecipientAccountId(accountId, pageable)
                .map(AlarmResponse::from);
    }

    public long getUnreadCount(Long accountId) {
        return alarmRepository.countByRecipientAccountIdAndReadAtIsNull(accountId);
    }
}
