package com.teamlms.backend.domain.mentoring.service;

import com.teamlms.backend.domain.mentoring.api.dto.*;
import com.teamlms.backend.domain.mentoring.entity.*;
import com.teamlms.backend.domain.mentoring.repository.*;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.function.Function;
import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentoringQueryService {

    private final MentoringRecruitmentRepository recruitmentRepository;
    private final com.teamlms.backend.domain.account.repository.AccountRepository accountRepository;
    private final com.teamlms.backend.domain.mentoring.repository.MentoringApplicationRepository applicationRepository;
    private final com.teamlms.backend.domain.mentoring.repository.MentoringMatchingRepository matchingRepository;
    private final com.teamlms.backend.domain.mentoring.repository.MentoringQuestionRepository questionRepository;
    private final com.teamlms.backend.domain.mentoring.repository.MentoringAnswerRepository answerRepository;
    private final com.teamlms.backend.domain.account.repository.StudentProfileRepository studentProfileRepository;
    private final com.teamlms.backend.domain.account.repository.ProfessorProfileRepository professorProfileRepository;
    private final com.teamlms.backend.domain.dept.repository.DeptRepository deptRepository;
    private final com.teamlms.backend.domain.semester.repository.SemesterRepository semesterRepository;

    public List<MentoringMatchingResponse> getMyMatchings(Long accountId) {
        List<MentoringApplication> myApps = applicationRepository.findAllByAccountId(accountId);
        if (myApps.isEmpty())
            return Collections.emptyList();

        List<Long> myAppIds = myApps.stream().map(MentoringApplication::getApplicationId).toList();
        List<MentoringMatching> matchings = matchingRepository
                .findAllByMentorApplicationIdInOrMenteeApplicationIdIn(myAppIds, myAppIds);

        List<Long> allAppIds = new ArrayList<>();
        matchings.forEach(m -> {
            allAppIds.add(m.getMentorApplicationId());
            allAppIds.add(m.getMenteeApplicationId());
        });

        Map<Long, MentoringApplication> appMap = applicationRepository.findAllById(allAppIds).stream()
                .collect(Collectors.toMap(MentoringApplication::getApplicationId, Function.identity()));

        List<Long> partnerAccountIds = matchings.stream()
                .map(m -> myAppIds.contains(m.getMentorApplicationId())
                        ? appMap.get(m.getMenteeApplicationId()).getAccountId()
                        : appMap.get(m.getMentorApplicationId()).getAccountId())
                .toList();

        Map<Long, Account> accountMap = accountRepository.findAllById(partnerAccountIds).stream()
                .collect(Collectors.toMap(Account::getAccountId, Function.identity(), (a, b) -> a));

        // 상대방 프로필 정보 조회
        Map<Long, String> nameMap = new HashMap<>();
        List<com.teamlms.backend.domain.account.entity.StudentProfile> students = studentProfileRepository.findAllById(partnerAccountIds);
        students.forEach(s -> nameMap.put(s.getAccountId(), s.getName()));

        List<com.teamlms.backend.domain.account.entity.ProfessorProfile> professors = professorProfileRepository.findAllById(partnerAccountIds);
        professors.forEach(p -> nameMap.put(p.getAccountId(), p.getName()));

        List<Long> recruitmentIds = matchings.stream().map(MentoringMatching::getRecruitmentId).toList();
        Map<Long, MentoringRecruitment> recruitMap = recruitmentRepository.findAllById(recruitmentIds).stream()
                .collect(Collectors.toMap(MentoringRecruitment::getRecruitmentId, Function.identity()));

        return matchings.stream().map(m -> {
            boolean isMentor = myAppIds.contains(m.getMentorApplicationId());
            MentoringApplication partnerApp = isMentor ? appMap.get(m.getMenteeApplicationId())
                    : appMap.get(m.getMentorApplicationId());
            Account partnerAcc = accountMap.get(partnerApp.getAccountId());
            MentoringRecruitment recruitment = recruitMap.get(m.getRecruitmentId());

            String partnerRealName = nameMap.getOrDefault(partnerApp.getAccountId(), 
                partnerAcc != null ? partnerAcc.getLoginId() : "Unknown");

            return MentoringMatchingResponse.builder()
                    .matchingId(m.getMatchingId())
                    .recruitmentId(m.getRecruitmentId())
                    .recruitmentTitle(recruitment.getTitle())
                    .partnerId(partnerApp.getAccountId())
                    .partnerName(partnerRealName)
                    .role(isMentor ? "MENTOR" : "MENTEE")
                    .status(m.getStatus().name())
                    .matchedAt(m.getMatchedAt())
                    .build();
        }).toList();
    }

    public List<MentoringChatMessageResponse> getChatHistory(Long matchingId) {
        if (!matchingRepository.existsById(matchingId)) {
            throw new BusinessException(ErrorCode.MENTORING_MATCHING_NOT_FOUND);
        }

        List<MentoringQuestion> questions = questionRepository.findAllByMatchingId(matchingId);
        if (questions.isEmpty())
            return Collections.emptyList();

        List<Long> qIds = questions.stream().map(MentoringQuestion::getQuestionId).toList();
        List<MentoringAnswer> answers = answerRepository.findAllByQuestionIdIn(qIds);

        List<Long> writerIds = new ArrayList<>();
        questions.forEach(q -> writerIds.add(q.getCreatedBy()));
        answers.forEach(a -> writerIds.add(a.getCreatedBy()));

        if (writerIds.isEmpty())
            return new ArrayList<>();

        Map<Long, Account> accountMap = accountRepository.findAllById(writerIds).stream()
                .collect(Collectors.toMap(Account::getAccountId, Function.identity(), (a, b) -> a));

        // 프로필 정보 조회
        Map<Long, String> nameMap = new HashMap<>();
        List<com.teamlms.backend.domain.account.entity.StudentProfile> students = studentProfileRepository.findAllById(writerIds);
        students.forEach(s -> nameMap.put(s.getAccountId(), s.getName()));

        List<com.teamlms.backend.domain.account.entity.ProfessorProfile> professors = professorProfileRepository.findAllById(writerIds);
        professors.forEach(p -> nameMap.put(p.getAccountId(), p.getName()));

        List<MentoringChatMessageResponse> chat = new ArrayList<>();

        for (MentoringQuestion q : questions) {
            String senderName = nameMap.getOrDefault(q.getCreatedBy(), 
                accountMap.containsKey(q.getCreatedBy()) ? accountMap.get(q.getCreatedBy()).getLoginId() : "Unknown");
            
            chat.add(MentoringChatMessageResponse.builder()
                    .id(q.getQuestionId())
                    .senderId(q.getCreatedBy())
                    .senderName(senderName)
                    .content(q.getContent())
                    .type("QUESTION")
                    .createdAt(q.getCreatedAt())
                    .build());
        }

        for (MentoringAnswer a : answers) {
            String senderName = nameMap.getOrDefault(a.getCreatedBy(), 
                accountMap.containsKey(a.getCreatedBy()) ? accountMap.get(a.getCreatedBy()).getLoginId() : "Unknown");

            chat.add(MentoringChatMessageResponse.builder()
                    .id(a.getAnswerId())
                    .senderId(a.getCreatedBy())
                    .senderName(senderName)
                    .content(a.getContent())
                    .type("ANSWER")
                    .createdAt(a.getCreatedAt())
                    .build());
        }

        chat.sort(Comparator.comparing(MentoringChatMessageResponse::getCreatedAt));
        return chat;
    }

    public Page<MentoringRecruitmentResponse> getRecruitments(Pageable pageable, Long currentAccountId, String keyword, MentoringRecruitmentStatus status) {
        Page<MentoringRecruitment> recruitments;
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        if (status != null) {
            if (status == MentoringRecruitmentStatus.OPEN) {
                // OPEN 조회 시 날짜 조건 추가 → 현재 모집 기간 내 공고만 반환
                if (keyword != null && !keyword.isBlank()) {
                    recruitments = recruitmentRepository.findByStatusAndWithinDateRangeAndTitleContaining(status, now, keyword, pageable);
                } else {
                    recruitments = recruitmentRepository.findByStatusAndWithinDateRange(status, now, pageable);
                }
            } else {
                if (keyword != null && !keyword.isBlank()) {
                    recruitments = recruitmentRepository.findByStatusAndTitleContainingIgnoreCase(status, keyword, pageable);
                } else {
                    recruitments = recruitmentRepository.findByStatus(status, pageable);
                }
            }
        } else {
            if (keyword != null && !keyword.isBlank()) {
                recruitments = recruitmentRepository.findByTitleContainingIgnoreCase(keyword, pageable);
            } else {
                recruitments = recruitmentRepository.findAll(pageable);
            }
        }
        
        if (currentAccountId == null || recruitments.isEmpty()) {
            return recruitments.map(MentoringRecruitmentResponse::from);
        }

        List<Long> recruitIds = recruitments.stream().map(MentoringRecruitment::getRecruitmentId).toList();
        
        // Semester 정보 조회
        Set<Long> semesterIds = recruitments.stream().map(MentoringRecruitment::getSemesterId).collect(Collectors.toSet());
        Map<Long, String> semesterNameMap = new HashMap<>();
        if (!semesterIds.isEmpty()) {
            semesterRepository.findAllById(semesterIds)
                .forEach(s -> semesterNameMap.put(s.getSemesterId(), s.getDisplayName()));
        }

        Map<Long, MentoringApplication> myAppMap = applicationRepository.findAllByRecruitmentIdInAndAccountId(recruitIds, currentAccountId)
                .stream()
                .collect(Collectors.toMap(MentoringApplication::getRecruitmentId, Function.identity(), (a, b) -> a));

        return recruitments.map(entity -> {
            MentoringRecruitmentResponse.MentoringRecruitmentResponseBuilder builder = MentoringRecruitmentResponse.builder()
                    .recruitmentId(entity.getRecruitmentId())
                    .semesterId(entity.getSemesterId())
                    .semesterName(semesterNameMap.getOrDefault(entity.getSemesterId(), String.valueOf(entity.getSemesterId())))
                    .title(entity.getTitle())
                    .description(entity.getDescription())
                    .recruitStartAt(entity.getRecruitStartAt())
                    .recruitEndAt(entity.getRecruitEndAt())
                    .status(entity.getStatus())
                    .createdAt(entity.getCreatedAt());

            MentoringApplication myApp = myAppMap.get(entity.getRecruitmentId());
            if (myApp != null) {
                builder.appliedRole(myApp.getRole().name())
                       .applyStatus(myApp.getStatus());
            }
            return builder.build();
        });
    }

    public MentoringRecruitmentResponse getRecruitment(Long id) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));
        
        String semesterName = semesterRepository.findById(recruitment.getSemesterId())
                .map(com.teamlms.backend.domain.semester.entity.Semester::getDisplayName)
                .orElse(String.valueOf(recruitment.getSemesterId()));

        return MentoringRecruitmentResponse.builder()
                .recruitmentId(recruitment.getRecruitmentId())
                .semesterId(recruitment.getSemesterId())
                .semesterName(semesterName)
                .title(recruitment.getTitle())
                .description(recruitment.getDescription())
                .recruitStartAt(recruitment.getRecruitStartAt())
                .recruitEndAt(recruitment.getRecruitEndAt())
                .status(recruitment.getStatus())
                .createdAt(recruitment.getCreatedAt())
                .build();
    }

    public List<MentoringApplicationResponse> getApplications(Long recruitmentId) {
        List<MentoringApplication> apps = applicationRepository.findAllByRecruitmentId(recruitmentId);
        if (apps.isEmpty()) return Collections.emptyList();

        List<Long> accountIds = apps.stream().map(MentoringApplication::getAccountId).toList();

        Map<Long, Account> accountMap = accountRepository.findAllById(accountIds).stream()
                .collect(Collectors.toMap(Account::getAccountId, Function.identity(), (a, b) -> a));

        List<com.teamlms.backend.domain.account.entity.StudentProfile> students = studentProfileRepository.findAllById(accountIds);
        Map<Long, com.teamlms.backend.domain.account.entity.StudentProfile> studentMap = students.stream()
            .collect(Collectors.toMap(com.teamlms.backend.domain.account.entity.StudentProfile::getAccountId, Function.identity()));

        List<com.teamlms.backend.domain.account.entity.ProfessorProfile> professors = professorProfileRepository.findAllById(accountIds);
        Map<Long, com.teamlms.backend.domain.account.entity.ProfessorProfile> professorMap = professors.stream()
            .collect(Collectors.toMap(com.teamlms.backend.domain.account.entity.ProfessorProfile::getAccountId, Function.identity()));

        Set<Long> deptIds = new HashSet<>();
        students.forEach(s -> { if(s.getDeptId() != null) deptIds.add(s.getDeptId()); });
        professors.forEach(p -> { if(p.getDeptId() != null) deptIds.add(p.getDeptId()); });
        Map<Long, String> deptNameMap = new HashMap<>(); 
        if (!deptIds.isEmpty()) {
             deptRepository.findAllById(deptIds).forEach(d -> deptNameMap.put(d.getDeptId(), d.getDeptName()));
        }

        // [추가] 매칭 정보 조회하여 멘토별 매칭 수 계산
        List<MentoringMatching> matchings = matchingRepository.findAllByRecruitmentId(recruitmentId);
        Map<Long, Long> matchedCountMap = matchings.stream()
                .collect(Collectors.groupingBy(MentoringMatching::getMentorApplicationId, Collectors.counting()));

        return apps.stream().map(app -> {
            Account account = accountMap.get(app.getAccountId());
            MentoringApplicationResponse.MentoringApplicationResponseBuilder builder = MentoringApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .recruitmentId(app.getRecruitmentId())
                .accountId(app.getAccountId())
                .role(app.getRole())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .applyReason(app.getApplyReason())
                .matchedCount(matchedCountMap.getOrDefault(app.getApplicationId(), 0L));

            if (account != null) {
                builder.loginId(account.getLoginId());
                if (account.getAccountType() == com.teamlms.backend.domain.account.enums.AccountType.STUDENT) {
                     var p = studentMap.get(app.getAccountId());
                     if (p != null) {
                         builder.name(p.getName())
                                .email(p.getEmail())
                                .phone(p.getPhone())
                                .studentNo(p.getStudentNo())
                                .gradeLevel(p.getGradeLevel())
                                .deptName(deptNameMap.get(p.getDeptId()));
                     } else {
                         builder.name(account.getLoginId()); 
                     }
                } else if (account.getAccountType() == com.teamlms.backend.domain.account.enums.AccountType.PROFESSOR) {
                     var p = professorMap.get(app.getAccountId());
                     if (p != null) {
                         builder.name(p.getName())
                                .email(p.getEmail())
                                .phone(p.getPhone())
                                .deptName(deptNameMap.get(p.getDeptId()));
                     } else {
                         builder.name(account.getLoginId());
                     }
                } else {
                    builder.name(account.getLoginId());
                }
            } else {
                builder.loginId("Unknown");
                builder.name("Unknown");
            }
            return builder.build();
        }).toList();
    }

    public List<MentoringMatchingAdminResponse> getAdminMatchings(Long recruitmentId) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(recruitmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTORING_RECRUITMENT_NOT_FOUND));

        List<MentoringMatching> matchings = matchingRepository.findAllByRecruitmentId(recruitmentId);
        if (matchings.isEmpty()) return Collections.emptyList();

        List<Long> allAppIds = new ArrayList<>();
        matchings.forEach(m -> {
            allAppIds.add(m.getMentorApplicationId());
            allAppIds.add(m.getMenteeApplicationId());
        });

        Map<Long, MentoringApplication> appMap = applicationRepository.findAllById(allAppIds).stream()
                .collect(Collectors.toMap(MentoringApplication::getApplicationId, Function.identity()));

        List<Long> accountIds = appMap.values().stream().map(MentoringApplication::getAccountId).toList();
        
        Map<Long, Account> accountMap = accountRepository.findAllById(accountIds).stream()
                .collect(Collectors.toMap(Account::getAccountId, Function.identity(), (a, b) -> a));

        Map<Long, String> nameMap = new HashMap<>();
        studentProfileRepository.findAllById(accountIds).forEach(s -> nameMap.put(s.getAccountId(), s.getName()));
        professorProfileRepository.findAllById(accountIds).forEach(p -> nameMap.put(p.getAccountId(), p.getName()));

        return matchings.stream().map(m -> {
            MentoringApplication mentorApp = appMap.get(m.getMentorApplicationId());
            MentoringApplication menteeApp = appMap.get(m.getMenteeApplicationId());
            
            String mentorName = mentorApp != null ? nameMap.getOrDefault(mentorApp.getAccountId(),
                accountMap.containsKey(mentorApp.getAccountId()) ? accountMap.get(mentorApp.getAccountId()).getLoginId() : "Unknown") : "Unknown";
            String menteeName = menteeApp != null ? nameMap.getOrDefault(menteeApp.getAccountId(),
                accountMap.containsKey(menteeApp.getAccountId()) ? accountMap.get(menteeApp.getAccountId()).getLoginId() : "Unknown") : "Unknown";

            return MentoringMatchingAdminResponse.builder()
                    .matchingId(m.getMatchingId())
                    .recruitmentId(m.getRecruitmentId())
                    .recruitmentTitle(recruitment.getTitle())
                    .mentorAccountId(mentorApp != null ? mentorApp.getAccountId() : null)
                    .mentorName(mentorName)
                    .menteeAccountId(menteeApp != null ? menteeApp.getAccountId() : null)
                    .menteeName(menteeName)
                    .status(m.getStatus().name())
                    .matchedAt(m.getMatchedAt())
                    .build();
        }).toList();
    }
}
