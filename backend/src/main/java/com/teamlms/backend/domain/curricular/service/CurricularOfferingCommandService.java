package com.teamlms.backend.domain.curricular.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.curricular.entity.Curricular;
import com.teamlms.backend.domain.curricular.entity.CurricularOffering;
import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.curricular.repository.CurricularRepository;
import com.teamlms.backend.domain.semester.repository.SemesterRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CurricularOfferingCommandService {

    private final CurricularRepository curricularRepository;
    private final CurricularOfferingRepository curricularOfferingRepository;
    private final SemesterRepository semesterRepository;
    private final AccountRepository accountRepository;
    private final ProfessorProfileRepository professorProfileRepository;

    // 개설 생성
    public void create(
        String offeringCode,
        Long curricularId,
        Long semesterId,
        DayOfWeekType dayOfWeek,
        Integer period,
        Integer capacity,
        String location,
        Long professorAccountId
    ) {
        // 교수검증
        Account acc = accountRepository.findById(professorAccountId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND, professorAccountId));

        if (acc.getAccountType() != AccountType.PROFESSOR) {
            throw new BusinessException(ErrorCode.INVALID_PROFESSOR_ACCOUNT, professorAccountId);
        }

        if (!professorProfileRepository.existsById(professorAccountId)) {
            throw new BusinessException(ErrorCode.PROFESSOR_PROFILE_NOT_FOUND, professorAccountId);
        }


        // 1) 교과목 존재 검증
        if(!curricularRepository.existsById(curricularId)) {
            throw new BusinessException(ErrorCode.CURRICULAR_NOT_FOUND, curricularId);
        }

        // 2) 개설코드 중복 검증
        if(curricularOfferingRepository.existsByOfferingCode(offeringCode)) {
            throw new BusinessException(ErrorCode.CURRICULAR_OFFERING_CODE_ALREADY_EXISTS, offeringCode);
        }

        // 3) 학기 존재 검증
        if(!semesterRepository.existsById(semesterId)) {
            throw new BusinessException(ErrorCode.SEMESTER_NOT_FOUND, semesterId);
        }

        CurricularOffering curricularOffering = CurricularOffering.builder()
            .offeringCode(offeringCode)
            .curricularId(curricularId)
            .semesterId(semesterId)
            .dayOfWeek(dayOfWeek)
            .period(period)
            .capacity(capacity)
            .location(location)
            .professorAccountId(professorAccountId)
            .status(OfferingStatus.DRAFT)
            .build();
        
        curricularOfferingRepository.save(curricularOffering);
    }
}
