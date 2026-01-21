package com.teamlms.backend.domain.community.service;

import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.community.api.dto.*;
import com.teamlms.backend.domain.community.dto.InternalQnaSearchRequest;
import com.teamlms.backend.domain.community.entity.QnaAnswer;
import com.teamlms.backend.domain.community.entity.QnaCategory;
import com.teamlms.backend.domain.community.entity.QnaQuestion;
import com.teamlms.backend.domain.community.repository.QnaAnswerRepository;
import com.teamlms.backend.domain.community.repository.QnaCategoryRepository;
import com.teamlms.backend.domain.community.repository.QnaQuestionRepository;

// 에러코드 임포트
import com.teamlms.backend.global.exception.base.BusinessException;
import com.teamlms.backend.global.exception.code.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QnaService {

    private final QnaQuestionRepository questionRepository;
    private final QnaAnswerRepository answerRepository;
    private final QnaCategoryRepository categoryRepository;
    private final AccountRepository accountRepository;

    // --- 질문 (Question) ---

    public Page<ExternalQnaResponse> getQuestionList(Pageable pageable, Long categoryId, String keyword) {
        InternalQnaSearchRequest condition = InternalQnaSearchRequest.builder()
                .categoryId(categoryId)
                .keyword(keyword)
                .build();

        Page<QnaQuestion> posts = questionRepository.findBySearchCondition(
                condition.getCategoryId(), condition.getKeyword(), pageable);

        return posts.map(entity -> ExternalQnaResponse.builder()
                .questionId(entity.getId())
                .category(toCategoryDto(entity.getCategory()))
                .title(entity.getTitle())
                .viewCount(entity.getViewCount())
                // [수정] Account에 있는 loginId를 이름으로 사용
                .authorName(entity.getAuthor().getLoginId()) 
                .createdAt(entity.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .hasAnswer(entity.getAnswer() != null)
                .build());
    }

    @Transactional
    public ExternalQnaDetailResponse getQuestionDetail(Long questionId) {
        QnaQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
        
        question.increaseViewCount();

        ExternalAnswerResponse answerDto = null;
        if (question.getAnswer() != null) {
            QnaAnswer ans = question.getAnswer();
            answerDto = ExternalAnswerResponse.builder()
                    .answerId(ans.getId())
                    .content(ans.getContent())
                    // [수정] Account에 있는 loginId를 이름으로 사용
                    .authorName(ans.getAuthor().getLoginId())
                    .createdAt(ans.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                    .build();
        }

        return ExternalQnaDetailResponse.builder()
                .questionId(question.getId())
                .category(toCategoryDto(question.getCategory()))
                .title(question.getTitle())
                .content(question.getContent())
                .viewCount(question.getViewCount())
                // [수정] Account에 있는 loginId를 이름으로 사용
                .authorName(question.getAuthor().getLoginId())
                .authorId(question.getAuthor().getAccountId())
                .createdAt(question.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .answer(answerDto)
                .build();
    }

    @Transactional
    public Long createQuestion(ExternalQnaRequest request, Long authorId) {
        Account author = accountRepository.findById(authorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_AUTHOR_NOT_FOUND));
        QnaCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        QnaQuestion question = QnaQuestion.builder()
                .category(category).author(author)
                .title(request.getTitle()).content(request.getContent())
                .build();
        return questionRepository.save(question).getId();
    }

    @Transactional
    public void updateQuestion(Long questionId, ExternalQnaRequest request, Long userId) {
        QnaQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        if (!question.getAuthor().getAccountId().equals(userId)) {
             throw new IllegalArgumentException("작성자만 수정 가능합니다.");
        }
        QnaCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        }
        question.update(category, request.getTitle(), request.getContent());
    }

    // [수정된 부분] 
    @Transactional
    public void deleteQuestion(Long questionId, Long userId) {
        // 1. 삭제할 질문 조회
        QnaQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));

        // 2. 요청한 사용자 정보 조회
        Account requestUser = accountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_AUTHOR_NOT_FOUND));

        // 3. 권한 체크 (관리자이거나, 작성자 본인이거나)
        //  [수정 포인트] Account 엔티티의 필드명은 'accountType' 입니다.
        boolean isAdmin = requestUser.getAccountType().name().equals("ADMIN"); 
        
        // Account 엔티티의 ID 필드명은 'accountId' 이므로 getAccountId() 사용 (이건 맞음)
        boolean isWriter = question.getAuthor().getAccountId().equals(userId);

        if (!isAdmin && !isWriter) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        questionRepository.delete(question);
    }

    // --- 답변 (Answer) ---

    @Transactional
    public void createAnswer(Long questionId, ExternalAnswerRequest request, Long adminId) {
        QnaQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
        if (question.getAnswer() != null) throw new IllegalArgumentException("이미 답변이 존재합니다.");

        Account admin = accountRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_AUTHOR_NOT_FOUND));

        QnaAnswer answer = QnaAnswer.builder()
                .question(question).author(admin).content(request.getContent()).build();
        answerRepository.save(answer);
    }

    @Transactional
    public void updateAnswer(Long questionId, ExternalAnswerRequest request) {
        QnaQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
        if (question.getAnswer() == null) throw new IllegalArgumentException("답변이 없습니다.");
        
        question.getAnswer().update(request.getContent());
    }

    

    @Transactional
    public void deleteAnswer(Long questionId) {
        // 1. 질문 조회
        QnaQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
        
        // 2. 답변이 있는지 확인
        if (question.getAnswer() == null) {
             // 답변이 없으면 에러를 던지거나, 그냥 조용히 리턴(선택사항)
             throw new IllegalArgumentException("삭제할 답변이 없습니다.");
        }

        // 3. 연결 끊기 (orphanRemoval = true 덕분에 여기서 자동으로 DELETE 쿼리 발생)
        question.removeAnswer();
        
        // answerRepository.delete(answer);  <-- 이 줄은 이제 필요 없습니다! 지우세요.
    }

    private ExternalCategoryResponse toCategoryDto(QnaCategory c) {
        return ExternalCategoryResponse.builder()
                .categoryId(c.getId()).name(c.getName())
                .bgColorHex(c.getBgColorHex()).textColorHex(c.getTextColorHex()).build();
    }
}