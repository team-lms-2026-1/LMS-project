package com.teamlms.backend.domain.mentoring.service;

import com.teamlms.backend.domain.mentoring.api.dto.MentoringRecruitmentResponse;
import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import com.teamlms.backend.domain.mentoring.repository.MentoringRecruitmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public java.util.List<com.teamlms.backend.domain.mentoring.api.dto.MentoringMatchingResponse> getMyMatchings(
            Long accountId) {
        java.util.List<com.teamlms.backend.domain.mentoring.entity.MentoringApplication> myApps = applicationRepository
                .findAllByAccountId(accountId);
        if (myApps.isEmpty())
            return java.util.Collections.emptyList();

        java.util.List<Long> myAppIds = myApps.stream()
                .map(com.teamlms.backend.domain.mentoring.entity.MentoringApplication::getApplicationId).toList();
        java.util.List<com.teamlms.backend.domain.mentoring.entity.MentoringMatching> matchings = matchingRepository
                .findAllByMentorApplicationIdInOrMenteeApplicationIdIn(myAppIds, myAppIds);

        java.util.List<Long> mentorAppIds = matchings.stream()
                .map(com.teamlms.backend.domain.mentoring.entity.MentoringMatching::getMentorApplicationId).toList();
        java.util.List<Long> menteeAppIds = matchings.stream()
                .map(com.teamlms.backend.domain.mentoring.entity.MentoringMatching::getMenteeApplicationId).toList();

        java.util.List<Long> allAppIds = new java.util.ArrayList<>();
        allAppIds.addAll(mentorAppIds);
        allAppIds.addAll(menteeAppIds);

        java.util.Map<Long, com.teamlms.backend.domain.mentoring.entity.MentoringApplication> appMap = applicationRepository
                .findAllById(allAppIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.teamlms.backend.domain.mentoring.entity.MentoringApplication::getApplicationId,
                        java.util.function.Function.identity()));

        java.util.List<Long> partnerAccountIds = matchings.stream()
                .map(m -> {
                    if (myAppIds.contains(m.getMentorApplicationId())) {
                        return appMap.get(m.getMenteeApplicationId()).getAccountId();
                    } else {
                        return appMap.get(m.getMentorApplicationId()).getAccountId();
                    }
                }).toList();

        java.util.Map<Long, com.teamlms.backend.domain.account.entity.Account> accountMap = accountRepository
                .findAllById(partnerAccountIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.teamlms.backend.domain.account.entity.Account::getAccountId,
                        java.util.function.Function.identity()));

        java.util.List<Long> recruitmentIds = matchings.stream()
                .map(com.teamlms.backend.domain.mentoring.entity.MentoringMatching::getRecruitmentId).toList();
        java.util.Map<Long, MentoringRecruitment> recruitMap = recruitmentRepository.findAllById(recruitmentIds)
                .stream()
                .collect(java.util.stream.Collectors.toMap(MentoringRecruitment::getRecruitmentId,
                        java.util.function.Function.identity()));

        return matchings.stream().map(m -> {
            boolean isMentor = myAppIds.contains(m.getMentorApplicationId());
            com.teamlms.backend.domain.mentoring.entity.MentoringApplication partnerApp = isMentor
                    ? appMap.get(m.getMenteeApplicationId())
                    : appMap.get(m.getMentorApplicationId());
            com.teamlms.backend.domain.account.entity.Account partnerAcc = accountMap.get(partnerApp.getAccountId());
            MentoringRecruitment recruitment = recruitMap.get(m.getRecruitmentId());

            return com.teamlms.backend.domain.mentoring.api.dto.MentoringMatchingResponse.builder()
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

    public java.util.List<com.teamlms.backend.domain.mentoring.api.dto.MentoringChatMessageResponse> getChatHistory(
            Long matchingId) {
        java.util.List<com.teamlms.backend.domain.mentoring.entity.MentoringQuestion> questions = questionRepository
                .findAllByMatchingId(matchingId);
        if (questions.isEmpty())
            return java.util.Collections.emptyList();

        java.util.List<Long> qIds = questions.stream()
                .map(com.teamlms.backend.domain.mentoring.entity.MentoringQuestion::getQuestionId).toList();
        java.util.List<com.teamlms.backend.domain.mentoring.entity.MentoringAnswer> answers = answerRepository
                .findAllByQuestionIdIn(qIds);

        java.util.List<Long> writerIds = new java.util.ArrayList<>();
        writerIds.addAll(questions.stream()
                .map(com.teamlms.backend.domain.mentoring.entity.MentoringQuestion::getWriterId).toList());
        writerIds.addAll(answers.stream().map(com.teamlms.backend.domain.mentoring.entity.MentoringAnswer::getWriterId)
                .toList());

        java.util.Map<Long, com.teamlms.backend.domain.account.entity.Account> accountMap = accountRepository
                .findAllById(writerIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.teamlms.backend.domain.account.entity.Account::getAccountId,
                        java.util.function.Function.identity(), (a, b) -> a));

        java.util.List<com.teamlms.backend.domain.mentoring.api.dto.MentoringChatMessageResponse> chat = new java.util.ArrayList<>();

        for (com.teamlms.backend.domain.mentoring.entity.MentoringQuestion q : questions) {
            com.teamlms.backend.domain.account.entity.Account writer = accountMap.get(q.getWriterId());
            chat.add(com.teamlms.backend.domain.mentoring.api.dto.MentoringChatMessageResponse.builder()
                    .id(q.getQuestionId())
                    .senderId(q.getWriterId())
                    .senderName(writer.getLoginId())
                    .content(q.getContent())
                    .type("QUESTION")
                    .createdAt(q.getCreatedAt())
                    .build());
        }

        for (com.teamlms.backend.domain.mentoring.entity.MentoringAnswer a : answers) {
            com.teamlms.backend.domain.account.entity.Account writer = accountMap.get(a.getWriterId());
            chat.add(com.teamlms.backend.domain.mentoring.api.dto.MentoringChatMessageResponse.builder()
                    .id(a.getAnswerId())
                    .senderId(a.getWriterId())
                    .senderName(writer.getLoginId())
                    .content(a.getContent())
                    .type("ANSWER")
                    .createdAt(a.getCreatedAt())
                    .build());
        }

        chat.sort(java.util.Comparator
                .comparing(com.teamlms.backend.domain.mentoring.api.dto.MentoringChatMessageResponse::getCreatedAt));
        return chat;
    }

    public Page<MentoringRecruitmentResponse> getRecruitments(Pageable pageable) {
        return recruitmentRepository.findAll(pageable)
                .map(MentoringRecruitmentResponse::from);
    }

    public MentoringRecruitmentResponse getRecruitment(Long id) {
        MentoringRecruitment recruitment = recruitmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mentoring recruitment not found"));
        return MentoringRecruitmentResponse.from(recruitment);
    }

    public java.util.List<com.teamlms.backend.domain.mentoring.api.dto.MentoringApplicationResponse> getApplications(
            Long recruitmentId) {
        java.util.List<com.teamlms.backend.domain.mentoring.entity.MentoringApplication> apps = applicationRepository
                .findAllByRecruitmentId(recruitmentId);

        java.util.List<Long> accountIds = apps.stream()
                .map(com.teamlms.backend.domain.mentoring.entity.MentoringApplication::getAccountId)
                .toList();

        java.util.Map<Long, com.teamlms.backend.domain.account.entity.Account> accountMap = accountRepository
                .findAllById(accountIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.teamlms.backend.domain.account.entity.Account::getAccountId,
                        java.util.function.Function.identity()));

        return apps.stream()
                .map(app -> com.teamlms.backend.domain.mentoring.api.dto.MentoringApplicationResponse.of(app,
                        accountMap.get(app.getAccountId())))
                .toList();
    }
}
