"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import styles from "./MentoringChat.module.css";
import { sendQuestion, sendAnswer, fetchChatHistory } from "../api/mentoringApi";
import { useMentoringChat } from "../hooks/useMentoringChat";
import { useAuth } from "@/features/auth/AuthProvider";
import toast from "react-hot-toast";

export default function MentoringChatPage() {
    const { state } = useAuth();
    const myAccountId = state.me?.accountId;

    const {
        matchings,
        selectedId,
        setSelectedId,
        messages,
        setMessages,
        loadingRooms,
        refreshChat
    } = useMentoringChat();

    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);

    const messageEndRef = useRef<HTMLDivElement>(null);

    const activeRoom = useMemo(() => matchings.find(m => m.matchingId === selectedId), [matchings, selectedId]);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (!selectedId) return;

        const timer = setInterval(async () => {
            try {
                const res = await fetchChatHistory(selectedId);
                const data = res.data;
                setMessages(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(data)) return data;
                    return prev;
                });
            } catch (e) { }
        }, 5000);

        return () => clearInterval(timer);
    }, [selectedId, setMessages]);

    const handleSend = async () => {
        if (!inputValue.trim() || !activeRoom || sending) return;

        try {
            setSending(true);
            if (activeRoom.role === "MENTEE") {
                await sendQuestion({
                    matchingId: activeRoom.matchingId,
                    content: inputValue
                });
            } else {
                const lastQuestion = [...messages].reverse().find(m => m.type === "QUESTION");

                if (lastQuestion) {
                    await sendAnswer({
                        questionId: lastQuestion.id,
                        content: inputValue
                    });
                } else {
                    await sendQuestion({
                        matchingId: activeRoom.matchingId,
                        content: inputValue
                    });
                }
            }
            setInputValue("");
            refreshChat();
            setTimeout(scrollToBottom, 50);
        } catch (e: any) {
            console.error(e);
            toast.error("전송 실패: " + (e.message || ""));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarTitle}>멘토링 채팅</div>
                <div className={styles.roomList}>
                    {loadingRooms ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>로딩 중...</div>
                    ) : matchings.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>매칭된 멘토링이 없습니다.</div>
                    ) : (
                        matchings.map(room => (
                            <div
                                key={room.matchingId}
                                className={`${styles.roomItem} ${selectedId === room.matchingId ? styles.active : ""}`}
                                onClick={() => setSelectedId(room.matchingId)}
                            >
                                <div className={styles.roomInfo}>
                                    <span className={styles.partnerName}>{room.partnerName} ({room.role === "MENTOR" ? "멘티" : "멘토"})</span>
                                    <span className={styles.recruitmentTitle}>{room.recruitmentTitle}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={styles.chatContainer}>
                {activeRoom ? (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatPartnerName}>{activeRoom.partnerName}</div>
                            <div className={styles.chatInfo}>{activeRoom.recruitmentTitle}</div>
                        </div>

                        <div className={styles.messageArea}>
                            {messages.map((msg, idx) => {
                                const isMine = !!(myAccountId && msg.senderId === myAccountId);
                                const dateStr = new Date(msg.createdAt).toLocaleDateString();
                                const showDate = idx === 0 || new Date(messages[idx - 1].createdAt).toLocaleDateString() !== dateStr;

                                return (
                                    <div key={`${msg.type}-${msg.id}`}>
                                        {showDate && (
                                            <div className={styles.dateDivider}>
                                                <span className={styles.dateText}>{dateStr}</span>
                                            </div>
                                        )}
                                        <div className={`${styles.messageRow} ${isMine ? styles.myMessage : styles.partnerMessage}`}>
                                            {!isMine && <div className={styles.messageSender}>{msg.senderName}</div>}
                                            <div className={styles.messageContentWrapper}>
                                                <div className={styles.messageTime}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className={styles.bubble}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        <div className={styles.inputArea}>
                            <textarea
                                className={styles.textarea}
                                placeholder="메시지를 입력하세요..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <button
                                className={styles.sendButton}
                                onClick={handleSend}
                                disabled={!inputValue.trim() || sending}
                            >
                                전송
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>💬</div>
                        <h3>대화방을 선택해주세요</h3>
                        <p>멘토링 매칭 완료 후 대화를 시작할 수 있습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

