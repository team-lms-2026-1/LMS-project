"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";
import { aiAskApi } from "../api/aiApi";

export default function AiTestPage() {
  const t = useI18n("aiAdvisor.testPage");
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    try {
      const res = await aiAskApi({ question: input });
      setAnswer(res.data.answer);
    } catch (e) {
      console.error("[AiTestPage:handleAsk]", e);
      toast.error(t("askFailed"));
    }
  };

  return (
    <div>
      <h2>{t("title")}</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("placeholder")}
      />
      <button onClick={handleAsk}>{t("askButton")}</button>
      <p>{answer}</p>
    </div>
  );
}
