package com.teamlms.backend.domain.study_rental.service;

import com.teamlms.backend.domain.study_rental.api.dto.RentalResponse;
import com.teamlms.backend.domain.study_rental.dto.RentalSearchCondition;
import com.teamlms.backend.domain.study_rental.entity.StudyRoomRental;
import com.teamlms.backend.domain.study_rental.repository.StudyRoomRentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyRentalQueryService {

    private final StudyRoomRentalRepository rentalRepository;
// 원본 코드
//     public Page<RentalResponse> getRentalList(RentalSearchCondition condition, Pageable pageable) {
//         Page<StudyRoomRental> rentals = rentalRepository.search(condition, pageable);

//         return rentals.map(this::toRentalResponse);
//     }
    public Page<RentalResponse> getRentalList(RentalSearchCondition condition, Pageable pageable) {
        Page<StudyRoomRental> rentals = rentalRepository.search(
                condition.getSpaceId(),
                condition.getApplicantId(),
                condition.getStatus(),
                condition.getKeyword(),
                pageable
        );
        return rentals.map(this::toRentalResponse);
        }
    
        private RentalResponse toRentalResponse(StudyRoomRental rental) {
                return RentalResponse.builder()
            .rentalId(rental.getId())
            // Null 체크 추가
            .rentalDate(rental.getStartAt() != null ? rental.getStartAt().toLocalDate() : null)
            .startTime(rental.getStartAt() != null ? rental.getStartAt().toLocalTime() : null)
            .endTime(rental.getEndAt() != null ? rental.getEndAt().toLocalTime() : null)
            .status(rental.getStatus())
            .requestedAt(rental.getAppliedAt())
            .space(rental.getStudyRoom() != null && rental.getStudyRoom().getStudySpace() != null ? 
                RentalResponse.SpaceSummary.builder()
                    .spaceId(rental.getStudyRoom().getStudySpace().getId())
                    .spaceName(rental.getStudyRoom().getStudySpace().getSpaceName())
                    .build() : null)
            .room(rental.getStudyRoom() != null ? 
                RentalResponse.RoomSummary.builder()
                    .roomId(rental.getStudyRoom().getId())
                    .roomName(rental.getStudyRoom().getRoomName())
                    .build() : null)
            .applicant(rental.getApplicant() != null ? 
                RentalResponse.AccountSummary.builder()
                    .accountId(rental.getApplicant().getAccountId())
                    .build() : null)
            .build();
        }
}
//원본 코드
//     private RentalResponse toRentalResponse(StudyRoomRental rental) {
//         return RentalResponse.builder()
//                 .rentalId(rental.getId())
//                 .rentalDate(rental.getStartAt().toLocalDate())
//                 .startTime(rental.getStartAt().toLocalTime())
//                 .endTime(rental.getEndAt().toLocalTime())
//                 .status(rental.getStatus())
//                 .requestedAt(rental.getAppliedAt())
//                 .rejectionReason(rental.getRejectionReason())
                
//                 .space(RentalResponse.SpaceSummary.builder()
//                         .spaceId(rental.getStudyRoom().getStudySpace().getId())
//                         .spaceName(rental.getStudyRoom().getStudySpace().getSpaceName())
//                         .build())
//                 .room(RentalResponse.RoomSummary.builder()
//                         .roomId(rental.getStudyRoom().getId())
//                         .roomName(rental.getStudyRoom().getRoomName())
//                         .build())
//                 .applicant(RentalResponse.AccountSummary.builder()
//                         .accountId(rental.getApplicant().getAccountId())
//                         // Account 엔티티에 getName() 등이 있다고 가정
//                         // .name(rental.getApplicant().getName()) 
//                         .build())
//                 .build();
//     }
// }