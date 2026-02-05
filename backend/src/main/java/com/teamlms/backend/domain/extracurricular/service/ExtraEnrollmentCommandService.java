package com.teamlms.backend.domain.extracurricular.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularApplication;
import com.teamlms.backend.domain.extracurricular.entity.ExtraCurricularOffering;
import com.teamlms.backend.domain.extracurricular.enums.ExtraApplicationApplyStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularApplicationRepository;
import com.teamlms.backend.domain.extracurricular.repository.ExtraCurricularOfferingRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ExtraEnrollmentCommandService {

    private final ExtraCurricularOfferingRepository offeringRepository;
    private final ExtraCurricularApplicationRepository applicationRepository;

    public void enroll(Long offeringId, Long studentAccountId) {
        LocalDateTime now = LocalDateTime.now();

        ExtraCurricularOffering offering = offeringRepository.findById(offeringId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        // OPEN만 신청 가능
        if (offering.getStatus() != ExtraOfferingStatus.OPEN) {
            throw new BusinessException(ErrorCode.OFFERING_NOT_ENROLLABLE, offeringId, offering.getStatus());
        }

        applicationRepository.findByExtraOfferingIdAndStudentAccountId(offeringId, studentAccountId)
            .ifPresentOrElse(app -> {
                if (app.getApplyStatus() == ExtraApplicationApplyStatus.APPLIED) {
                    throw new BusinessException(ErrorCode.EXTRA_APPLICATION_ALREADY_EXISTS, offeringId, studentAccountId);
                }
                if (app.getApplyStatus() == ExtraApplicationApplyStatus.CANCELED) {
                    app.reApply(now);
                    return;
                }
                throw new BusinessException(
                    ErrorCode.EXTRA_APPLICATION_STATUS_CONFLICT,
                    offeringId, studentAccountId, app.getApplyStatus()
                );
            }, () -> {
                ExtraCurricularApplication created =
                    ExtraCurricularApplication.createApplied(offeringId, studentAccountId, now);
                applicationRepository.save(created);
            });
    }

    // ✅ 신청 취소 (OPEN 상태에서만 가능)
    public void cancel(Long offeringId, Long studentAccountId) {
        LocalDateTime now = LocalDateTime.now();

        ExtraCurricularOffering offering = offeringRepository.findById(offeringId)
            .orElseThrow(() -> new BusinessException(ErrorCode.EXTRA_CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        // OPEN만 취소 가능
        if (offering.getStatus() != ExtraOfferingStatus.OPEN) {
            throw new BusinessException(ErrorCode.OFFERING_NOT_ENROLLABLE, offeringId, offering.getStatus());
        }

        ExtraCurricularApplication app = applicationRepository
            .findByExtraOfferingIdAndStudentAccountId(offeringId, studentAccountId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "extraApplication", offeringId, studentAccountId));
            // ↑ 전용 에러코드 만들면 더 좋음: EXTRA_APPLICATION_NOT_FOUND (404)

        // 이미 취소면 409
        if (app.getApplyStatus() == ExtraApplicationApplyStatus.CANCELED) {
            throw new BusinessException(ErrorCode.CONFLICT, "already canceled", offeringId, studentAccountId);
            // ↑ 전용 에러코드 추천: EXTRA_APPLICATION_ALREADY_CANCELED
        }

        // 신청 상태가 아니면(방어)
        if (app.getApplyStatus() != ExtraApplicationApplyStatus.APPLIED) {
            throw new BusinessException(
                ErrorCode.EXTRA_APPLICATION_STATUS_CONFLICT,
                offeringId, studentAccountId, app.getApplyStatus()
            );
        }

        app.cancel(now);
    }
}
