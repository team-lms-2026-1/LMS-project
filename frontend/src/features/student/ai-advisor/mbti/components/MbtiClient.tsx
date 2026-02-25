"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocale } from "@/hooks/useLocale";
import { ApiError } from "@/lib/http";
import styles from "./MbtiClient.module.css";
import {
  createMbtiRecommendation,
  fetchInterestKeywords,
  fetchLatestRecommendation,
  fetchMbtiQuestions,
  fetchMbtiResult,
  submitMbtiAnswers,
} from "../api/mbtiApi";
import {
  InterestKeyword,
  MbtiQuestion,
  MbtiRecommendation,
  MbtiResult,
  MbtiSubmitRequest,
} from "../api/types";
import { MbtiHomeStep } from "./MbtiHomeStep";
import { MbtiTestStep } from "./MbtiTestStep";
import { MbtiKeywordStep } from "./MbtiKeywordStep";
import { MbtiResultStep } from "./MbtiResultStep";

type ViewMode = "home" | "test" | "keywords" | "result";

const MIN_KEYWORD_COUNT = 2;
const MBTI_MENU_RESET_EVENT = "student:mbti-menu-reset";

export default function MbtiClient() {
  const { locale } = useLocale();
  
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [questions, setQuestions] = useState<MbtiQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [keywords, setKeywords] = useState<InterestKeyword[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<number[]>([]);
  const [recommendation, setRecommendation] = useState<MbtiRecommendation | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetToHome = useCallback(() => {
    setViewMode("home");
    setQuestions([]);
    setAnswers({});
    setKeywords([]);
    setSelectedKeywordIds([]);
    setSubmitting(false);
    setError(null);
  }, []);

  useEffect(() => {
    const handleMenuReset = () => {
      resetToHome();
    };

    window.addEventListener(MBTI_MENU_RESET_EVENT, handleMenuReset);
    return () => {
      window.removeEventListener(MBTI_MENU_RESET_EVENT, handleMenuReset);
    };
  }, [resetToHome]);

  // 언어 변경 시 홈 화면으로 리셋
  useEffect(() => {
    if (viewMode !== "home") {
      resetToHome();
    }
  }, [locale]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const [latestRecommendation, latestResult] = await Promise.all([
          fetchOptionalRecommendation(),
          fetchOptionalResult(),
        ]);
        setRecommendation(latestRecommendation);
        setResult(latestResult);
        setViewMode("home");
      } catch (e) {
        console.error("[MbtiClient:init]", e);
        setError(getErrorMessage(e, "MBTI 정보를 불러오지 못했습니다."));
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const allAnswered = useMemo(
    () => questions.length > 0 && answeredCount === questions.length,
    [answeredCount, questions.length]
  );

  const handleSelectAnswer = (questionId: number, choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleStartTest = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const questionRes = await fetchMbtiQuestions();
      const sortedQuestions = [...(questionRes.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
      setQuestions(sortedQuestions);
      setAnswers({});
      setSelectedKeywordIds([]);
      setViewMode("test");
    } catch (e) {
      console.error("[MbtiClient:startTest]", e);
      toast.error(getErrorMessage(e, "MBTI 문항을 불러오지 못했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowResult = () => {
    if (!result && !recommendation) {
      toast.error("저장된 결과가 없습니다. 검사하기를 먼저 진행해 주세요.");
      return;
    }
    setViewMode("result");
  };

  const handleSubmitMbti = async () => {
    if (!allAnswered) {
      toast.error("모든 문항에 응답해 주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const body: MbtiSubmitRequest = {
        answers: questions.map((question) => ({
          questionId: question.questionId,
          choiceId: answers[question.questionId],
        })),
      };

      const resultRes = await submitMbtiAnswers(body);
      if (!resultRes.data) {
        toast.error("MBTI 결과 생성에 실패했습니다.");
        return;
      }

      setResult(resultRes.data);
      setRecommendation(null);

      const keywordRes = await fetchInterestKeywords();
      setKeywords(keywordRes.data ?? []);
      setSelectedKeywordIds([]);
      setViewMode("keywords");
      toast.success("MBTI 검사가 완료되었습니다.");
    } catch (e) {
      console.error("[MbtiClient:submitMbti]", e);
      toast.error(getErrorMessage(e, "MBTI 제출 중 오류가 발생했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleKeyword = (keywordId: number) => {
    setSelectedKeywordIds((prev) => {
      if (prev.includes(keywordId)) {
        return prev.filter((id) => id !== keywordId);
      }
      return [...prev, keywordId];
    });
  };

  const handleCreateRecommendation = async () => {
    if (selectedKeywordIds.length < MIN_KEYWORD_COUNT) {
      toast.error("관심 키워드를 2개 이상 선택해 주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const recommendationRes = await createMbtiRecommendation({
        keywordIds: selectedKeywordIds,
      });
      setRecommendation(recommendationRes.data);
      setViewMode("result");
      toast.success("추천 결과가 생성되었습니다.");
    } catch (e) {
      console.error("[MbtiClient:createRecommendation]", e);
      toast.error(getErrorMessage(e, "추천 결과 생성 중 오류가 발생했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (viewMode === "home") {
    return (
      <MbtiHomeStep
        hasResult={Boolean(result || recommendation)}
        loading={submitting}
        onStartTest={handleStartTest}
        onShowResult={handleShowResult}
      />
    );
  }

  if (viewMode === "test") {
    return (
      <MbtiTestStep
        questions={questions}
        answers={answers}
        answeredCount={answeredCount}
        allAnswered={allAnswered}
        submitting={submitting}
        onSelectAnswer={handleSelectAnswer}
        onSubmit={handleSubmitMbti}
      />
    );
  }

  if (viewMode === "keywords") {
    return (
      <MbtiKeywordStep
        keywords={keywords}
        selectedKeywordIds={selectedKeywordIds}
        minKeywordCount={MIN_KEYWORD_COUNT}
        submitting={submitting}
        onToggleKeyword={toggleKeyword}
        onSubmit={handleCreateRecommendation}
      />
    );
  }

  return <MbtiResultStep recommendation={recommendation} result={result} />;
}

async function fetchOptionalResult() {
  try {
    const response = await fetchMbtiResult();
    return response.data;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
      return null;
    }
    throw e;
  }
}

async function fetchOptionalRecommendation() {
  try {
    const response = await fetchLatestRecommendation();
    return response.data;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
      return null;
    }
    throw e;
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

