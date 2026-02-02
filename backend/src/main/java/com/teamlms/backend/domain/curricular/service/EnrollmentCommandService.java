package com.teamlms.backend.domain.curricular.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.curricular.entity.CurricularOffering;
import com.teamlms.backend.domain.curricular.entity.Enrollment;
import com.teamlms.backend.domain.curricular.enums.EnrollmentStatus;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;
import com.teamlms.backend.domain.curricular.repository.CurricularOfferingRepository;
import com.teamlms.backend.domain.curricular.repository.EnrollmentRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentCommandService {

    private final CurricularOfferingRepository offeringRepository;
    private final EnrollmentRepository enrollmentRepository;

    // 수강신청 (선착순)
    public void enroll(Long offeringId, Long studentAccountId) {

        CurricularOffering offering = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId));

        // 1) 상태 체크 (OPEN만 신청 가능)
        if (offering.getStatus() != OfferingStatus.OPEN) {
            throw new BusinessException(ErrorCode.OFFERING_NOT_ENROLLABLE, offeringId, offering.getStatus());
        }

        // 2) 기존 신청 여부 (유니크키 때문에 "재신청"은 update로 처리)
        Optional<Enrollment> opt = enrollmentRepository.findByOfferingIdAndStudentAccountId(offeringId, studentAccountId);

        if (opt.isPresent()) {
            Enrollment e = opt.get();

            // 이미 신청 상태면 중복
            if (e.getEnrollmentStatus() == EnrollmentStatus.ENROLLED) {
                throw new BusinessException(ErrorCode.ENROLLMENT_ALREADY_EXISTS, offeringId, studentAccountId);
            }

            // CANCELED -> ENROLLED 로 복구 (재신청 허용 정책)
            // 점수/성적 관련은 초기화(아직 수업 전이므로)
            e.reEnroll(LocalDateTime.now());; // 아래에 setter 없으면 엔티티 메서드 만들거나 reflection 안쓰고 필드 접근 불가니 메서드 추가 필요
            // e.resetGradeInfo(); 같은 거 만들어도 됨 (선택)
            // appliedAt 갱신은 정책 선택: 재신청 시점 기록하려면 갱신
            // e.setAppliedAt(LocalDateTime.now());
        } else {
            // 3) 정원 체크 (현재 ENROLLED count)
            long enrolledCount = enrollmentRepository.countByOfferingIdAndEnrollmentStatus(offeringId, EnrollmentStatus.ENROLLED);
            if (enrolledCount >= offering.getCapacity()) {
                // 꽉 찼으면 CLOSE로 바꾸고 충돌 응답
                offering.changeStatus(OfferingStatus.ENROLLMENT_CLOSED);
                throw new BusinessException(ErrorCode.OFFERING_CAPACITY_FULL, offeringId);
            }

            Enrollment e = Enrollment.builder()
                    .offeringId(offeringId)
                    .studentAccountId(studentAccountId)
                    .enrollmentStatus(EnrollmentStatus.ENROLLED)
                    .completionStatus(com.teamlms.backend.domain.curricular.enums.CompletionStatus.IN_PROGRESS)
                    .isGradeConfirmed(false)
                    .appliedAt(LocalDateTime.now())
                    .build();

            enrollmentRepository.save(e);
        }

        // 4) 신청 후 정원 꽉 찼으면 ENROLLMENT_CLOSED로 자동 전환
        long afterCount = enrollmentRepository.countByOfferingIdAndEnrollmentStatus(offeringId, EnrollmentStatus.ENROLLED);
        if (afterCount >= offering.getCapacity()) {
            offering.changeStatus(OfferingStatus.ENROLLMENT_CLOSED);
        }
    }

    // 신청 취소 (status 변경만)
    public void cancel(Long offeringId, Long studentAccountId) {

        CurricularOffering offering = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.CURRICULAR_OFFERING_NOT_FOUND, offeringId
                ));

        // ✅ 신청취소 가능 상태 제한
        if (!(offering.getStatus() == OfferingStatus.OPEN
                || offering.getStatus() == OfferingStatus.ENROLLMENT_CLOSED)) {
            throw new BusinessException(
                    ErrorCode.ENROLLMENT_CANCEL_NOT_ALLOWED_STATUS,
                    offeringId,
                    offering.getStatus()
            );
            // 또는 return; 로 idempotent하게 할 수도 있는데,
            // 일반적으로 "취소 불가 기간"은 명확히 409/403으로 알려주는 게 UX/정책상 좋음
        }

        Enrollment e = enrollmentRepository.findByOfferingIdAndStudentAccountId(offeringId, studentAccountId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.ENROLLMENT_NOT_FOUND, offeringId, studentAccountId
                ));

        // 이미 취소/드랍 상태면 idemponent 처리
        if (e.getEnrollmentStatus() != EnrollmentStatus.ENROLLED) {
            return;
        }

        e.cancel();

        // ✅ 취소로 인해 자리 생기면 ENROLLMENT_CLOSED -> OPEN 자동 전환(정책)
        if (offering.getStatus() == OfferingStatus.ENROLLMENT_CLOSED) {
            long enrolledCount = enrollmentRepository.countByOfferingIdAndEnrollmentStatus(
                    offeringId, EnrollmentStatus.ENROLLED
            );
            if (enrolledCount < offering.getCapacity()) {
                offering.changeStatus(OfferingStatus.OPEN);
            }
        }
    }

}
