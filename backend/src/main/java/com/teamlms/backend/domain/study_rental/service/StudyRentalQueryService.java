package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.entity.ProfessorProfile;
import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.study_rental.api.dto.RentalResponse;
import com.teamlms.backend.domain.study_rental.dto.RentalSearchCondition;
import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.enums.RentalStatus;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRentalRepository;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.security.principal.AuthUser;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyRentalQueryService {

        private final StudyRoomRentalRepository rentalRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final ProfessorProfileRepository professorProfileRepository;
        private final DeptRepository deptRepository;

        public Page<RentalResponse> getRentalList(RentalSearchCondition condition, Pageable pageable) {
                Page<StudyRoomRental> rentals = rentalRepository.search(
                                condition.getSpaceId(),
                                condition.getApplicantId(),
                                condition.getStatus(),
                                condition.getKeyword(),
                                pageable);

                // 1. 예약자 Account ID 수집
                Set<Long> accountIds = rentals.getContent().stream()
                                .filter(r -> r.getApplicant() != null)
                                .map(r -> r.getApplicant().getAccountId())
                                .collect(Collectors.toSet());

                // 2. 학생 및 교수 프로필 일괄 조회
                Map<Long, StudentProfile> studentProfileMap = studentProfileRepository.findAllById(accountIds).stream()
                                .collect(Collectors.toMap(StudentProfile::getAccountId, Function.identity()));

                Set<Long> remainingIds = accountIds.stream()
                                .filter(id -> !studentProfileMap.containsKey(id))
                                .collect(Collectors.toSet());

                Map<Long, ProfessorProfile> professorProfileMap = remainingIds.isEmpty() ? Map.of()
                                : professorProfileRepository.findAllById(remainingIds).stream()
                                                .collect(Collectors.toMap(ProfessorProfile::getAccountId,
                                                                Function.identity()));

                // 3. 부서 ID 수집 및 조회
                Set<Long> deptIds = studentProfileMap.values().stream()
                                .map(StudentProfile::getDeptId)
                                .collect(Collectors.toSet());
                deptIds.addAll(professorProfileMap.values().stream()
                                .map(ProfessorProfile::getDeptId)
                                .collect(Collectors.toSet()));

                Map<Long, String> deptNameMap = deptIds.isEmpty() ? Map.of()
                                : deptRepository.findAllById(deptIds).stream()
                                                .collect(Collectors.toMap(Dept::getDeptId, Dept::getDeptName));

                // 4. 변환 (프로필 정보 주입)
                return rentals.map(rental -> toRentalResponse(rental, studentProfileMap, professorProfileMap,
                                deptNameMap));
        }

        private RentalResponse toRentalResponse(
                        StudyRoomRental rental,
                        Map<Long, StudentProfile> studentProfileMap,
                        Map<Long, ProfessorProfile> professorProfileMap,
                        Map<Long, String> deptNameMap) {

                String name = null;
                String identificationNo = null; // studentNo or professorNo
                String deptName = null;

                if (rental.getApplicant() != null) {
                        Long accountId = rental.getApplicant().getAccountId();
                        StudentProfile studentProfile = studentProfileMap.get(accountId);
                        if (studentProfile != null) {
                                name = studentProfile.getName();
                                identificationNo = studentProfile.getStudentNo();
                                deptName = deptNameMap.get(studentProfile.getDeptId());
                        } else {
                                ProfessorProfile professorProfile = professorProfileMap.get(accountId);
                                if (professorProfile != null) {
                                        name = professorProfile.getName();
                                        identificationNo = professorProfile.getProfessorNo();
                                        deptName = deptNameMap.get(professorProfile.getDeptId());
                                }
                        }
                }

                return RentalResponse.builder()
                                .rentalId(rental.getId())
                                .rentalDate(rental.getStartAt() != null ? rental.getStartAt().toLocalDate() : null)
                                .startTime(rental.getStartAt() != null ? rental.getStartAt().toLocalTime() : null)
                                .endTime(rental.getEndAt() != null ? rental.getEndAt().toLocalTime() : null)
                                .status(rental.getStatus())
                                .requestedAt(rental.getAppliedAt())
                                .rejectionReason(rental.getRejectionReason())
                                .space(rental.getStudyRoom() != null && rental.getStudyRoom().getStudySpace() != null
                                                ? RentalResponse.SpaceSummary.builder()
                                                                .spaceId(rental.getStudyRoom().getStudySpace().getId())
                                                                .spaceName(rental.getStudyRoom().getStudySpace()
                                                                                .getSpaceName())
                                                                .build()
                                                : null)
                                .room(rental.getStudyRoom() != null ? RentalResponse.RoomSummary.builder()
                                                .roomId(rental.getStudyRoom().getId())
                                                .roomName(rental.getStudyRoom().getRoomName())
                                                .build() : null)
                                .applicant(rental.getApplicant() != null ? RentalResponse.AccountSummary.builder()
                                                .accountId(rental.getApplicant().getAccountId())
                                                .name(name)
                                                .studentNo(identificationNo)
                                                .department(deptName)
                                                .build() : null)
                                .build();
        }

        // =================================================================================
        // 1. 내 예약 조회용 메서드 (Controller에서 호출)
        // =================================================================================
        public Page<RentalResponse> getMyRentalList(
                        String keyword,
                        Long spaceId,
                        RentalStatus status,
                        Pageable pageable,
                        Object principal) {
                // 1. principal에서 ID 추출
                Long accountId = extractAccountId(principal);

                // 2. 검색 조건 생성 (본인 ID 고정)
                RentalSearchCondition condition = RentalSearchCondition.builder()
                                .applicantId(accountId) // 여기가 핵심입니다.
                                .keyword(keyword)
                                .spaceId(spaceId)
                                .status(status)
                                .build();

                // 3. 기존의 강력한 getRentalList 메서드를 재사용 (매핑 로직 중복 방지)
                return getRentalList(condition, pageable);
        }

        // =================================================================================
        // 2. ID 추출 헬퍼 메서드
        // =================================================================================
        private Long extractAccountId(Object principal) {
                if (principal == null)
                        throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);

                if (principal instanceof AuthUser authUser)
                        return authUser.getAccountId();
                if (principal instanceof Account account)
                        return account.getAccountId();
                if (principal instanceof UserDetails userDetails) {
                        try {
                                return Long.parseLong(userDetails.getUsername());
                        } catch (NumberFormatException e) {
                                throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);
                        }
                }
                if (principal instanceof Long id)
                        return id;
                if (principal instanceof String s)
                        return Long.parseLong(s);

                throw new BusinessException(ErrorCode.STUDY_RENTAL_USER_NOT_FOUND);
        }
}
// 원본 코드
// private RentalResponse toRentalResponse(StudyRoomRental rental) {
// return RentalResponse.builder()
// .rentalId(rental.getId())
// .rentalDate(rental.getStartAt().toLocalDate())
// .startTime(rental.getStartAt().toLocalTime())
// .endTime(rental.getEndAt().toLocalTime())
// .status(rental.getStatus())
// .requestedAt(rental.getAppliedAt())
// .rejectionReason(rental.getRejectionReason())

// .space(RentalResponse.SpaceSummary.builder()
// .spaceId(rental.getStudyRoom().getStudySpace().getId())
// .spaceName(rental.getStudyRoom().getStudySpace().getSpaceName())
// .build())
// .room(RentalResponse.RoomSummary.builder()
// .roomId(rental.getStudyRoom().getId())
// .roomName(rental.getStudyRoom().getRoomName())
// .build())
// .applicant(RentalResponse.AccountSummary.builder()
// .accountId(rental.getApplicant().getAccountId())
// // Account 엔티티에 getName() 등이 있다고 가정
// // .name(rental.getApplicant().getName())
// .build())
// .build();
// }
// }