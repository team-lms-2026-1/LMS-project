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

        List<Long> recruitmentIds = matchings.stream().map(MentoringMatching::getRecruitmentId).toList();
        Map<Long, MentoringRecruitment> recruitMap = recruitmentRepository.findAllById(recruitmentIds).stream()
                .collect(Collectors.toMap(MentoringRecruitment::getRecruitmentId, Function.identity()));

        return matchings.stream().map(m -> {
            boolean isMentor = myAppIds.contains(m.getMentorApplicationId());
            MentoringApplication partnerApp = isMentor ? appMap.get(m.getMenteeApplicationId())
                    : appMap.get(m.getMentorApplicationId());
            Account partnerAcc = accountMap.get(partnerApp.getAccountId());
            MentoringRecruitment recruitment = recruitMap.get(m.getRecruitmentId());

            return MentoringMatchingResponse.builder()
                    .matchingId(m.getMatchingId())
                    .recruitmentId(m.getRecruitmentId())
                    .recruitmentTitle(recruitment.getTitle())
                    .partnerId(partnerAcc.getAccountId())
                    .partnerName(partnerAcc.getLoginId())
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

        List<MentoringChatMessageResponse> chat = new ArrayList<>();

        for (MentoringQuestion q : questions) {
            Account writer = accountMap.get(q.getWriterId());
            String senderName = (writer != null) ? writer.getLoginId() : "Unknown(" + q.getWriterId() + ")";
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
            Account writer = accountMap.get(a.getWriterId());
            String senderName = (writer != null) ? writer.getLoginId() : "Unknown(" + a.getWriterId() + ")";
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

    public Page<MentoringRecruitmentResponse> getRecruitments(Pageable pageable) {
        return recruitmentRepository.findAll(pageable).map(MentoringRecruitmentResponse::from);
    }

    public MentoringRecruitmentResponse getRecruitment(Long id) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mentoring recruitment not found"));
        return MentoringRecruitmentResponse.from(recruitment);
    }

    public List<MentoringApplicationResponse> getApplications(Long recruitmentId) {
        List<MentoringApplication> apps = applicationRepository.findAllByRecruitmentId(recruitmentId);
        List<Long> accountIds = apps.stream().map(MentoringApplication::getAccountId).toList();

        Map<Long, Account> accountMap = accountRepository.findAllById(accountIds).stream()
                .collect(Collectors.toMap(Account::getAccountId, Function.identity(), (a, b) -> a));

        return apps.stream()
                .map(app -> MentoringApplicationResponse.of(app, accountMap.get(app.getAccountId())))
                .toList();
    }
}
