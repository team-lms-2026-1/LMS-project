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
        List<MentoringQuestion> questions = questionRepository.findAllByMatchingId(matchingId);
        if (questions.isEmpty())
            return Collections.emptyList();

        List<Long> qIds = questions.stream().map(MentoringQuestion::getQuestionId).toList();
        List<MentoringAnswer> answers = answerRepository.findAllByQuestionIdIn(qIds);

        List<Long> writerIds = new ArrayList<>();
        questions.forEach(q -> writerIds.add(q.getWriterId()));
        answers.forEach(a -> writerIds.add(a.getWriterId()));

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
            String senderName = nameMap.getOrDefault(q.getWriterId(), 
                accountMap.containsKey(q.getWriterId()) ? accountMap.get(q.getWriterId()).getLoginId() : "Unknown");
            
            chat.add(MentoringChatMessageResponse.builder()
                    .id(q.getQuestionId())
                    .senderId(q.getWriterId())
                    .senderName(senderName)
                    .content(q.getContent())
                    .type("QUESTION")
                    .createdAt(q.getCreatedAt())
                    .build());
        }

        for (MentoringAnswer a : answers) {
            String senderName = nameMap.getOrDefault(a.getWriterId(), 
                accountMap.containsKey(a.getWriterId()) ? accountMap.get(a.getWriterId()).getLoginId() : "Unknown");

            chat.add(MentoringChatMessageResponse.builder()
                    .id(a.getAnswerId())
                    .senderId(a.getWriterId())
                    .senderName(senderName)
                    .content(a.getContent())
                    .type("ANSWER")
                    .createdAt(a.getCreatedAt())
                    .build());
        }

        chat.sort(Comparator.comparing(MentoringChatMessageResponse::getCreatedAt));
        return chat;
    }

    public Page<MentoringRecruitmentResponse> getRecruitments(Pageable pageable, Long currentAccountId) {
        Page<MentoringRecruitment> recruitments = recruitmentRepository.findAll(pageable);
        
        if (currentAccountId == null || recruitments.isEmpty()) {
            return recruitments.map(MentoringRecruitmentResponse::from);
        }

        List<Long> recruitIds = recruitments.stream().map(MentoringRecruitment::getRecruitmentId).toList();
        Map<Long, MentoringApplication> myAppMap = applicationRepository.findAllByRecruitmentIdInAndAccountId(recruitIds, currentAccountId)
                .stream()
                .collect(Collectors.toMap(MentoringApplication::getRecruitmentId, Function.identity(), (a, b) -> a));

        return recruitments.map(entity -> {
            MentoringRecruitmentResponse res = MentoringRecruitmentResponse.from(entity);
            MentoringApplication myApp = myAppMap.get(entity.getRecruitmentId());
            if (myApp != null) {
                // Use reflection or copy to new builder because from() returns built object
                // Let's modify MentoringRecruitmentResponse to have a better way or just rebuild here.
                return MentoringRecruitmentResponse.builder()
                        .recruitmentId(entity.getRecruitmentId())
                        .semesterId(entity.getSemesterId())
                        .title(entity.getTitle())
                        .description(entity.getDescription())
                        .recruitStartAt(entity.getRecruitStartAt())
                        .recruitEndAt(entity.getRecruitEndAt())
                        .status(entity.getStatus())
                        .createdAt(entity.getCreatedAt())
                        .appliedRole(myApp.getRole().name())
                        .applyStatus(myApp.getStatus())
                        .build();
            }
            return res;
        });
    }

    public MentoringRecruitmentResponse getRecruitment(Long id) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mentoring recruitment not found"));
        return MentoringRecruitmentResponse.from(recruitment);
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

        return apps.stream().map(app -> {
            Account account = accountMap.get(app.getAccountId());
            MentoringApplicationResponse.MentoringApplicationResponseBuilder builder = MentoringApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .recruitmentId(app.getRecruitmentId())
                .accountId(app.getAccountId())
                .role(app.getRole())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .applyReason(app.getApplyReason());

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
}
