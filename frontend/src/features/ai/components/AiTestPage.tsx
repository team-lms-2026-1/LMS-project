"use client"

import { useState } from "react";
import { aiAskApi } from "../api/aiApi";
import { AiaskResponse } from "../api/types";

export default function AiTestPage () {
    const [input, setInput] = useState("");
    const [answer, setAnswer] = useState("");

    const handleAsk = async () => {
        const res = await aiAskApi({question: input});
        setAnswer(res.data.answer);
    }

    return(
        <div>
            <h2>AI 테스트</h2>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />

            <button onClick={handleAsk}>질문</button>

            <p>{answer}</p>

        </div>
    )
}