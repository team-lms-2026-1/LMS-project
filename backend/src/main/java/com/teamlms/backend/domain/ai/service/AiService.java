package com.teamlms.backend.domain.ai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teamlms.backend.domain.ai.dto.AiAskResponse;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AiService {

    private final ChatClient chatClient;

    public AiAskResponse ask(String question) {
        String answer = chatClient
            .prompt()
            .user(question)
            .call()
            .content();
        
        return new AiAskResponse(answer);
    }
}
