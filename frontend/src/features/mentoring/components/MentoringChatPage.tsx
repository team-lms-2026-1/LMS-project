"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import styles from "./MentoringChat.module.css";
import { fetchMyMatchings, fetchChatHistory, sendQuestion, sendAnswer, MentoringMatching, ChatMessage } from "../lib/chatApi";
import { useAuth } from "@/features/auth/AuthProvider";
import toast from "react-hot-toast";

export default function MentoringChatPage() {
    const { state } = useAuth();
    const myAccountId = state.me?.accountId;

    const [matchings, setMatchings] = useState<MentoringMatching[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
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
        const init = async () => {
            setLoadingRooms(true);
            try {
                const data = await fetchMyMatchings();
                setMatchings(data || []);
                if (data && data.length > 0) {
                    setSelectedId(data[0].matchingId);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingRooms(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!selectedId) return;

        const loadChat = async () => {
            setLoadingChat(true);
            try {
                const data = await fetchChatHistory(selectedId);
                setMessages(data || []);
                setTimeout(scrollToBottom, 100);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingChat(false);
            }
        };

        loadChat();
        const timer = setInterval(async () => {
            try {
                const data = await fetchChatHistory(selectedId);
                setMessages(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(data)) return data;
                    return prev;
                });
            } catch (e) { }
        }, 5000);

        return () => clearInterval(timer);
    }, [selectedId]);

    const handleSend = async () => {
        if (!inputValue.trim() || !activeRoom || sending) return;

        try {
            setSending(true);
            if (activeRoom.role === "MENTEE") {
                // Mentees always send Questions
                await sendQuestion({
                    matchingId: activeRoom.matchingId,
                    content: inputValue
                });
            } else {
                // Mentors: check if there's an unanswered question
                const lastQuestion = [...messages].reverse().find(m => m.type === "QUESTION");

                if (lastQuestion) {
                    // If there's a question, send an Answer
                    await sendAnswer({
                        questionId: lastQuestion.id,
                        content: inputValue
                    });
                } else {
                    // If no question exists, mentor can also send a Question to start conversation
                    await sendQuestion({
                        matchingId: activeRoom.matchingId,
                        content: inputValue
                    });
                }
            }
            setInputValue("");
            const data = await fetchChatHistory(selectedId!);
            setMessages(data);
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
            {/* Sidebar Room List */}
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

            {/* Chat Area */}
            <div className={styles.chatContainer}>
                {activeRoom ? (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatPartnerName}>{activeRoom.partnerName}</div>
                            <div className={styles.chatInfo}>{activeRoom.recruitmentTitle}</div>
                        </div>

                        <div className={styles.messageArea}>
                            {messages.map((msg, idx) => {
                                // 내 메시지인지 확인 (ID 비교 및 로그인 ID/이름 비교, 또는 상대방 ID와 다른지 확인)
                                const isMine = !!(state.me && (
                                    msg.senderId == state.me.accountId ||
                                    msg.senderName === state.me.loginId
                                )) || !!(activeRoom && msg.senderId && msg.senderId != activeRoom.partnerId);
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
